import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:socket_io_client/socket_io_client.dart'
    // ignore: library_prefixes
    as IO;
import '../../services/user_service.dart';
import '../../services/auth_service.dart';
import '../../services/api_constrants.dart';
import 'chat_detail_page.dart';

class ChatListPage extends StatefulWidget {
  const ChatListPage({super.key});

  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage>
    with SingleTickerProviderStateMixin {
  List<dynamic> _allConversations = [];
  List<dynamic> _displayConversations = [];
  List<String> onlineUserIds = [];
  bool _isLoading = true;
  late TabController _tabController;
  late IO.Socket socket;
  String currentFilter = "all";

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _initSocketAndData();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) {
      setState(() {
        currentFilter = _tabController.index == 0 ? "all" : "unread";
        _filterConversations();
      });
    }
  }

  Future<void> _initSocketAndData() async {
    if (UserData.id == null) await UserService.fetchUserInfo();
    await _fetchConversations();
    _connectSocket();
  }

  // Kết nối Socket để lắng nghe tin nhắn mới ngay tại danh sách
  void _connectSocket() {
    socket = IO.io(ApiConstants.serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();

    // Khi socket kết nối, join vào phòng của chính mình để nhận thông báo
    socket.onConnect((_) {
      if (UserData.id != null) {
        socket.emit('user_online', UserData.id);
      }
    });

    socket.on('get_online_users', (data) {
      if (mounted) {
        setState(() {
          onlineUserIds = List<String>.from(data);
        });
      }
    });

    // Lắng nghe tin nhắn đến
    socket.on('receive_message', (data) {
      _handleNewMessage(data);
    });
  }

  // Xử lý khi có tin nhắn mới bay đến
  void _handleNewMessage(dynamic data) {
    if (!mounted) return;

    // Kiểm tra xem tin nhắn này có liên quan đến mình không
    String myId = UserData.id ?? "";
    String senderId = data['sender'] is Map
        ? data['sender']['_id']
        : data['sender'].toString();
    String receiverId = data['receiver'] is Map
        ? data['receiver']['_id']
        : data['receiver'].toString();

    // Nếu mình là người gửi hoặc người nhận
    if (senderId == myId || receiverId == myId) {
      setState(() {
        // 1. Tìm xem cuộc hội thoại này đã có trong list chưa
        String partnerId = (senderId == myId) ? receiverId : senderId;

        int existingIndex = _allConversations.indexWhere(
          (c) => c['partnerId'] == partnerId,
        );

        Map<String, dynamic> newConvoItem = {
          'partnerId': partnerId,
          'partnerName': data['partnerName'] ?? "Người dùng",
          'partnerAvatar': data['partnerAvatar'] ?? "",
          'lastMessage': data['content'],
          'time': DateTime.now().toIso8601String(),
          'isRead': (senderId == myId),
        };

        if (existingIndex != -1) {
          newConvoItem['partnerName'] =
              _allConversations[existingIndex]['partnerName'];
          newConvoItem['partnerAvatar'] =
              _allConversations[existingIndex]['partnerAvatar'];

          _allConversations.removeAt(existingIndex);
          _allConversations.insert(0, newConvoItem);
        } else {
          _fetchConversations();
          return;
        }

        _filterConversations();
      });
    }
  }

  Future<void> _fetchConversations() async {
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse(
        '${ApiConstants.baseUrl}/chat/conversations/${UserData.id}',
      );
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _allConversations = jsonDecode(response.body);
            _isLoading = false;
            _filterConversations();
          });
        }
      }
    } catch (e) {
      print("Lỗi load chat: $e");
    }
  }

  void _filterConversations() {
    if (currentFilter == "all") {
      _displayConversations = List.from(_allConversations);
    } else {
      _displayConversations = _allConversations.where((c) {
        String lastSenderId = (c['lastMessageSenderId'] ?? "")
            .toString()
            .trim();
        String myId = (UserData.id ?? "").toString().trim();
        bool amISender = (lastSenderId == myId);
        bool isRead = c['isRead'] ?? true;
        return !amISender && !isRead;
      }).toList();
    }
  }

  // Gọi API đánh dấu đã đọc
  Future<void> _markAsRead(String partnerId) async {
    setState(() {
      int index = _allConversations.indexWhere(
        (c) => c['partnerId'] == partnerId,
      );
      if (index != -1) {
        _allConversations[index]['isRead'] = true;
        _filterConversations();
      }
    });

    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('${ApiConstants.baseUrl}/chat/mark-read');
      await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'userId': UserData.id, 'partnerId': partnerId}),
      );
    } catch (e) {
      print("Lỗi mark read: $e");
    }
  }

  String _formatTime(String? timeString) {
    if (timeString == null) return "";
    try {
      DateTime time = DateTime.parse(timeString).toLocal();
      DateTime now = DateTime.now();
      if (time.year == now.year &&
          time.month == now.month &&
          time.day == now.day) {
        return DateFormat('HH:mm').format(time);
      }
      return DateFormat('dd/MM').format(time);
    } catch (e) {
      return "";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Tin nhắn",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: "Tất cả"),
            Tab(text: "Chưa đọc"),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
            )
          : _displayConversations.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 60,
                    color: Colors.grey.shade300,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    currentFilter == "all"
                        ? "Chưa có tin nhắn"
                        : "Không có tin chưa đọc",
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.separated(
              itemCount: _displayConversations.length,
              separatorBuilder: (ctx, i) =>
                  const Divider(height: 1, indent: 80),
              itemBuilder: (context, index) {
                return _buildConversationItem(_displayConversations[index]);
              },
            ),
    );
  }

  Widget _buildConversationItem(dynamic chat) {
    String name = chat['partnerName'] ?? "Người dùng";
    String avatar = chat['partnerAvatar'] ?? "";
    String lastMsg = chat['lastMessage'] ?? "";
    String time = _formatTime(chat['time']);
    String partnerId = chat['partnerId'] ?? "";

    // 1. Xử lý hiển thị tin nhắn Hình ảnh
    if (lastMsg.contains('/uploads/chat/') ||
        lastMsg.endsWith('.jpg') ||
        lastMsg.endsWith('.png') ||
        lastMsg.endsWith('.jpeg')) {
      lastMsg = "[Hình ảnh]";
    }

    // 2.  Xử lý hiển thị tin nhắn Đặt hàng (JSON)
    if (lastMsg.trim().startsWith('{') && lastMsg.contains('"title"')) {
      try {
        Map<String, dynamic> orderData = jsonDecode(lastMsg);
        if (orderData.containsKey('title')) {
          lastMsg = "Đơn hàng: ${orderData['title']}";
        }
      } catch (e) {
        // Nếu không phải chuỗi JSON hợp lệ thì bỏ qua, giữ nguyên tin nhắn gốc
      }
    }

    // Logic xác định trạng thái
    String lastSenderId = (chat['lastMessageSenderId'] ?? "").toString().trim();
    String myId = (UserData.id ?? "").toString().trim();
    bool amISender = (lastSenderId == myId);

    // Logic Đã đọc cuối cùng: Mình gửi -> True. Người khác gửi -> Theo server
    bool finalIsRead = amISender ? true : (chat['isRead'] ?? true);
    bool isPartnerOnline = onlineUserIds.contains(partnerId);

    // Style hiển thị
    FontWeight textWeight = finalIsRead ? FontWeight.normal : FontWeight.bold;
    Color textColor = finalIsRead ? Colors.grey.shade600 : Colors.black87;
    String displayMsg = amISender ? "Bạn: $lastMsg" : lastMsg;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      onTap: () async {
        // QUAN TRỌNG: Đánh dấu đọc trước khi chuyển trang
        if (!finalIsRead) {
          await _markAsRead(partnerId);
        }

        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatDetailPage(
              partnerId: partnerId,
              partnerName: name,
              partnerImage: avatar.isNotEmpty
                  ? avatar
                  : "https://i.pravatar.cc/300",
              isOnline: isPartnerOnline,
            ),
          ),
        );
        _fetchConversations();
      },
      leading: Stack(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundImage: (avatar.isNotEmpty && avatar.startsWith('http'))
                ? NetworkImage(avatar)
                : null,
            backgroundColor: Colors.grey.shade200,
            child: (avatar.isEmpty || !avatar.startsWith('http'))
                ? const Icon(Icons.person, color: Colors.grey)
                : null,
          ),
          if (!finalIsRead)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
          if (isPartnerOnline)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  color: Colors.green, // Màu xanh lá
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
      title: Text(name, style: TextStyle(fontWeight: textWeight, fontSize: 16)),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Text(
          displayMsg,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: textColor,
            fontWeight: textWeight,
            fontSize: 14,
          ),
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            time,
            style: TextStyle(
              color: finalIsRead ? Colors.grey.shade500 : Colors.blue[700],
              fontSize: 12,
              fontWeight: finalIsRead ? FontWeight.normal : FontWeight.bold,
            ),
          ),
          if (!finalIsRead)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Icon(Icons.circle, color: Colors.blue[700], size: 10),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    socket.disconnect();
    socket.dispose();
    _tabController.dispose();
    super.dispose();
  }
}
