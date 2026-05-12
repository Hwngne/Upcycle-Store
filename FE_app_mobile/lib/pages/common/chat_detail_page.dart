import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import '../../services/user_service.dart';
import '../../services/auth_service.dart';
import '../../services/api_constrants.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:photo_view/photo_view.dart';
import '../../services/socket_service.dart';
import '../../services/transaction_service.dart';
import 'package:bot_toast/bot_toast.dart';

class ChatDetailPage extends StatefulWidget {
  final String partnerId;
  final String partnerName;
  final String partnerImage;
  final bool isOnline;
  final Map<String, dynamic>? productInfo;

  const ChatDetailPage({
    super.key,
    required this.partnerId,
    required this.partnerName,
    required this.partnerImage,
    this.isOnline = false,
    this.productInfo,
  });

  @override
  State<ChatDetailPage> createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends State<ChatDetailPage> {
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late IO.Socket socket;
  late bool isPartnerOnline;

  List<dynamic> messages = [];
  bool _isLoading = true;
  String? myId;

  // Logic Sửa
  bool _isEditing = false;
  String? _editingMsgId;

  int _currentPage = 1;
  bool _isLoadingMore = false;
  bool _hasMoreMessages = true;
  final int _limit = 20;

  // Logic Typing
  bool _isPartnerTyping = false;
  Timer? _typingTimer;

  final String baseUrl = ApiConstants.baseUrl;
  final String serverUrl = ApiConstants.serverUrl;
  bool _showProductBanner = false;
  // --- HÀM THÔNG BÁO HIỆN ĐẠI (BOT TOAST) ---
  void _showCustomSnackBar(String message, {bool isSuccess = true}) {
    BotToast.showCustomNotification(
      toastBuilder: (cancelFunc) {
        return SafeArea(
          child: Card(
            color: isSuccess ? const Color(0xFF059669) : Colors.red.shade600,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            elevation: 6,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Icon(
                    isSuccess
                        ? Icons.check_circle_rounded
                        : Icons.error_outline_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      message,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
      duration: const Duration(seconds: 3),
      align: const Alignment(
        0,
        -0.99,
      ), // Hiển thị mượt mà từ cạnh trên màn hình
      animationDuration: const Duration(milliseconds: 200),
    );
  }

  @override
  void initState() {
    super.initState();
    isPartnerOnline = widget.isOnline;
    if (widget.productInfo != null) {
      _showProductBanner = true;
    }
    _initChat();
  }

  Future<void> _initChat() async {
    if (UserData.id == null) await UserService.fetchUserInfo();
    if (mounted) {
      setState(() {
        myId = UserData.id;
      });
    }
    if (myId == null) return;

    _connectSocket();
    _loadMessageHistory();
  }

  void _connectSocket() {
    final socketService = SocketService();

    if (socketService.socket == null || !socketService.socket!.connected) {
      socketService.initSocket(myId!);
    }
    socket = socketService.socket!;
    String roomId = _getRoomId(myId!, widget.partnerId);
    socketService.currentChatRoomId = roomId;
    socket.emit('join_room', roomId);
    socket.on('get_online_users', (data) {
      if (mounted) {
        List<String> onlineIds = List<String>.from(data);
        bool status = onlineIds.contains(widget.partnerId);
        if (status != isPartnerOnline) {
          setState(() => isPartnerOnline = status);
        }
      }
    });

    socket.on('receive_message', (data) {
      if (mounted) {
        dynamic senderData = data['sender'] ?? data['senderId'];
        String msgSenderId = (senderData is Map)
            ? senderData['_id'].toString()
            : senderData.toString();
        msgSenderId = msgSenderId.replaceAll('"', '').trim();
        String currentMyId = (myId ?? "").replaceAll('"', '').trim();
        if (msgSenderId != currentMyId) {
          setState(() {
            messages.insert(0, data);
            _isPartnerTyping = false;
          });
        }
      }
    });

    socket.on('message_revoked', (data) {
      if (mounted) {
        setState(() {
          final index = messages.indexWhere(
            (m) => m['_id'] == data['messageId'],
          );
          if (index != -1) {
            messages[index]['content'] = data['content'];
            messages[index]['type'] = 'revoked';
          }
        });
      }
    });

    socket.on('message_edited', (data) {
      if (mounted) {
        setState(() {
          final index = messages.indexWhere(
            (m) => m['_id'] == data['messageId'],
          );
          if (index != -1) {
            messages[index]['content'] = data['newContent'];
            messages[index]['isEdited'] = true;
          }
        });
      }
    });

    socket.on('display_typing', (data) {
      if (mounted) {
        setState(() {
          _isPartnerTyping = data['isTyping'];
        });
        if (_isPartnerTyping) {
          Future.delayed(const Duration(seconds: 5), () {
            if (mounted && _isPartnerTyping)
              setState(() => _isPartnerTyping = false);
          });
        }
      }
    });
  }

  void _scrollListener() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 50 &&
        !_isLoadingMore &&
        _hasMoreMessages &&
        !_isLoading) {
      print("Load more messages (Old history)...");
      _loadMessageHistory(loadMore: true);
    }
  }

  // Hàm gọi khi người dùng đang gõ tin nhắn
  void _onTyping() {
    socket.emit('typing', {
      'roomId': _getRoomId(myId!, widget.partnerId),
      'isTyping': true,
    });

    if (_typingTimer?.isActive ?? false) _typingTimer!.cancel();
    _typingTimer = Timer(const Duration(milliseconds: 1000), () {
      socket.emit('typing', {
        'roomId': _getRoomId(myId!, widget.partnerId),
        'isTyping': false,
      });
    });
  }

  void _showMessageOptions(Map<String, dynamic> msg, bool isMe) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.copy, color: Colors.blue),
                title: const Text('Sao chép'),
                onTap: () => Navigator.pop(context), // Todo: Copy
              ),
              if (isMe && msg['type'] != 'revoked') ...[
                ListTile(
                  leading: const Icon(Icons.edit, color: Colors.orange),
                  title: const Text('Chỉnh sửa'),
                  onTap: () {
                    Navigator.pop(context);
                    _startEditing(msg);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.undo, color: Colors.red),
                  title: const Text('Thu hồi'),
                  onTap: () {
                    Navigator.pop(context);
                    socket.emit('revoke_message', {
                      'messageId': msg['_id'],
                      'roomId': _getRoomId(myId!, widget.partnerId),
                    });
                  },
                ),
              ],
              ListTile(
                leading: const Icon(Icons.delete_outline, color: Colors.grey),
                title: const Text('Xóa ở phía tôi'),
                onTap: () {
                  Navigator.pop(context);
                  setState(
                    () => messages.removeWhere((m) => m['_id'] == msg['_id']),
                  );
                  socket.emit('delete_for_me', {
                    'messageId': msg['_id'],
                    'userId': myId,
                  });
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _startEditing(Map<String, dynamic> msg) {
    setState(() {
      _isEditing = true;
      _editingMsgId = msg['_id'];
      _msgController.text = msg['content'];
    });
    FocusScope.of(context).requestFocus(FocusNode());
  }

  void _cancelEditing() {
    setState(() {
      _isEditing = false;
      _editingMsgId = null;
      _msgController.clear();
    });
    FocusScope.of(context).unfocus();
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        height: 150,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildOptionItem(Icons.camera_alt, "Máy ảnh", ImageSource.camera),
            _buildOptionItem(Icons.photo, "Thư viện", ImageSource.gallery),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionItem(IconData icon, String label, ImageSource source) {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        _pickAndSendImage(source);
      },
      child: Column(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: const Color(0xFFB71C1C).withOpacity(0.1),
            child: Icon(icon, color: const Color(0xFFB71C1C), size: 30),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Future<void> _pickAndSendImage(ImageSource source) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: source,
      imageQuality: 70,
    );
    if (image != null) _uploadImage(image);
  }

  Future<void> _uploadImage(XFile file) async {
    try {
      setState(() => _isLoading = true);
      final token = await AuthService.getToken();
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/chat/upload-image'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(
        http.MultipartFile.fromBytes(
          'image',
          await file.readAsBytes(),
          filename: file.name,
        ),
      );
      var response = await request.send();

      if (response.statusCode == 200) {
        var json = jsonDecode(await response.stream.bytesToString());
        _sendSocketMessage(json['url'], type: 'image');
      }
    } catch (e) {
      print("Lỗi upload: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Logic Gửi tin nhắn
  void _sendSocketMessage(String content, {String type = 'text'}) {
    String tempId = DateTime.now().millisecondsSinceEpoch.toString();
    final localMessage = <String, dynamic>{
      '_id': tempId,
      'sender': myId,
      'receiver': widget.partnerId,
      'content': content,
      'createdAt': DateTime.now().toIso8601String(),
      'status': 'sending',
      'type': type,
      'isEdited': false,
    };

    if (mounted) {
      setState(() => messages.insert(0, localMessage));
      _scrollToBottom();
    }

    socket.emitWithAck(
      'send_message',
      {
        'senderId': myId,
        'receiverId': widget.partnerId,
        'content': content,
        'roomId': _getRoomId(myId!, widget.partnerId),
        'type': type,
      },
      ack: (response) {
        if (mounted && response != null && response['status'] == 'ok') {
          setState(() {
            final index = messages.indexWhere((m) => m['_id'] == tempId);
            if (index != -1) {
              messages[index]['status'] = 'sent';
              messages[index]['_id'] = response['data']['_id'];
            }
          });
        }
      },
    );
  }

  // Hàm format tiền tệ (Chuyển ép về int để mất số .0)
  String _formatCurrency(dynamic amount) {
    if (amount == null) return "Miễn phí";
    // Ép kiểu an toàn về số nguyên
    int value = amount is double
        ? amount.toInt()
        : int.tryParse(amount.toString()) ?? 0;

    return value.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        ) +
        "đ";
  }

  void _handleSendMessage() {
    String text = _msgController.text.trim();

    if (_showProductBanner && widget.productInfo != null) {
      bool isOrderRequest = widget.productInfo!['isOrderRequest'] ?? false;

      if (isOrderRequest) {
        //  Đặt mua sản phẩm
        Map<String, dynamic> orderData = {
          'title': widget.productInfo!['title'],
          'price': widget.productInfo!['price'],
          'image': widget.productInfo!['image'],
          'quantity': widget.productInfo!['orderQuantity'],
          'postId': widget.productInfo!['postId'],
          'status': 'pending',
        };

        _sendSocketMessage(jsonEncode(orderData), type: 'order');

        setState(() {
          _showProductBanner = false;
        });
      } else {
        String productName = widget.productInfo!['title'];
        String priceStr = _formatCurrency(widget.productInfo!['price']);
        String? imageUrl = widget.productInfo!['image'];

        // 1. GỬI TIN NHẮN HÌNH ẢNH TRƯỚC (Nếu có ảnh)
        if (imageUrl != null && imageUrl.isNotEmpty) {
          _sendSocketMessage(imageUrl, type: 'image');
        }

        // 2. TEXT CHỨA THÔNG TIN
        String prefix =
            "Tôi muốn trao đổi thêm về sản phẩm:\n- $productName\n- Giá: $priceStr";
        text = text.isEmpty ? prefix : "$prefix\n\n💬 $text";

        setState(() {
          _showProductBanner = false;
        });
      }
    }

    if (text.isEmpty) return; // Chặn nếu rỗng

    // Gửi tin nhắn text
    if (_isEditing && _editingMsgId != null) {
      socket.emit('edit_message', {
        'messageId': _editingMsgId,
        'newContent': text,
        'roomId': _getRoomId(myId!, widget.partnerId),
      });
      _cancelEditing();
      return;
    }

    _sendSocketMessage(text, type: 'text');
    _msgController.clear();
  }

  Future<void> _loadMessageHistory({bool loadMore = false}) async {
    if (_isLoadingMore) return;
    int pageToLoad = loadMore ? _currentPage + 1 : 1;

    try {
      if (loadMore) {
        setState(() => _isLoadingMore = true);
      } else {
        setState(() => _isLoading = true);
      }

      final token = await AuthService.getToken();
      final uri = Uri.parse(
        '$baseUrl/chat/$myId/${widget.partnerId}?page=$pageToLoad&limit=$_limit',
      );
      final response = await http.get(
        uri,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> newMessages = jsonDecode(response.body);

        if (mounted) {
          setState(() {
            if (newMessages.length < _limit) {
              _hasMoreMessages = false;
            }

            if (loadMore) {
              messages.addAll(newMessages);
              _currentPage++;
              _isLoadingMore = false;
            } else {
              messages = newMessages;
              _currentPage = 1;
              _hasMoreMessages = (newMessages.length == _limit);
              _isLoading = false;
            }
          });
        }
      }
    } catch (e) {
      print("Lỗi tải tin nhắn: $e");
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isLoadingMore = false;
        });
      }
    }
  }

  String _getRoomId(String user1, String user2) {
    List<String> ids = [user1, user2];
    ids.sort();
    return ids.join("_");
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          0.0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  @override
  void dispose() {
    SocketService().currentChatRoomId = null;
    socket.off('receive_message');
    socket.off('message_revoked');
    socket.off('message_edited');
    socket.off('display_typing');
    socket.off('get_online_users');
    _msgController.dispose();
    _scrollController.dispose();
    _typingTimer?.cancel();
    _scrollController.removeListener(_scrollListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(
                widget.partnerImage.isNotEmpty
                    ? widget.partnerImage
                    : "https://i.pravatar.cc/300",
              ),
              radius: 18,
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.partnerName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  isPartnerOnline ? "Online" : "Offline",
                  style: TextStyle(
                    fontSize: 12,
                    color: isPartnerOnline
                        ? Colors.greenAccent
                        : Colors.white70,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          Positioned.fill(child: _buildTelegramStyleBackground()),
          Column(
            children: [
              if (_isLoadingMore)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8.0),
                  child: SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.grey,
                    ),
                  ),
                ),
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFFB71C1C),
                        ),
                      )
                    : messages.isEmpty
                    ? const Center(
                        child: Text(
                          "Hãy bắt đầu trò chuyện!",
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        itemCount: messages.length,
                        reverse: true,
                        padding: const EdgeInsets.all(10),
                        itemBuilder: (context, index) {
                          final msg = messages[index];
                          bool showDate = false;
                          if (index == messages.length - 1) {
                            showDate = true;
                          } else {
                            DateTime currDate = DateTime.parse(
                              msg['createdAt'],
                            ).toLocal();
                            DateTime prevDate = DateTime.parse(
                              messages[index + 1]['createdAt'],
                            ).toLocal();
                            if (currDate.day != prevDate.day ||
                                currDate.month != prevDate.month ||
                                currDate.year != prevDate.year) {
                              showDate = true;
                            }
                          }

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (showDate)
                                _buildDateSeparator(msg['createdAt']),
                              _buildMessageItem(msg),
                            ],
                          );
                        },
                      ),
              ),

              if (_isPartnerTyping)
                Padding(
                  padding: const EdgeInsets.only(left: 16, bottom: 5),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 8,
                        backgroundImage: NetworkImage(widget.partnerImage),
                      ),
                      const SizedBox(width: 5),
                      const Text(
                        "Đang soạn tin...",
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              if (_showProductBanner && widget.productInfo != null)
                _buildProductBanner(),

              _buildInputArea(),
            ],
          ),
        ],
      ),
    );
  }

  // Widget hiển thị banner sản phẩm
  Widget _buildProductBanner() {
    final info = widget.productInfo!;
    String priceStr = _formatCurrency(info['price']);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF009688).withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          if (info['image'] != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                info['image'],
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (c, e, s) => Container(
                  width: 50,
                  height: 50,
                  color: Colors.grey[200],
                  child: const Icon(
                    Icons.image_not_supported,
                    color: Colors.grey,
                  ),
                ),
              ),
            )
          else
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.shopping_bag, color: Colors.grey),
            ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Bạn đang hỏi mua:",
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
                Text(
                  info['title'],
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF1A237E),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  priceStr,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 20, color: Colors.grey),
            onPressed: () => setState(() => _showProductBanner = false),
          ),
        ],
      ),
    );
  }

  // --- WIDGET: BACKGROUND TELEGRAM STYLE ---
  Widget _buildTelegramStyleBackground() {
    final List<IconData> doodleIcons = [
      Icons.eco_outlined,
      Icons.menu_book_rounded,
      Icons.recycling_rounded,
      Icons.school_outlined,
      Icons.water_drop_outlined,
      Icons.local_florist_outlined,
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFF0F5), Color(0xFFE8F5E9)],
        ),
      ),
      child: Opacity(
        opacity: 0.06,
        child: GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1,
          ),
          itemCount: 100,
          itemBuilder: (context, index) {
            double angle = (index % 3 == 0)
                ? 0.3
                : ((index % 2 == 0) ? -0.2 : 0.1);
            IconData icon = doodleIcons[index % doodleIcons.length];

            return Transform.rotate(
              angle: angle,
              child: Center(child: Icon(icon, size: 28, color: Colors.black87)),
            );
          },
        ),
      ),
    );
  }

  Widget _buildDateSeparator(String dateStr) {
    DateTime date = DateTime.parse(dateStr).toLocal();
    DateTime now = DateTime.now();
    String text;

    if (date.year == now.year &&
        date.month == now.month &&
        date.day == now.day) {
      text = "Hôm nay";
    } else if (date.year == now.year &&
        date.month == now.month &&
        date.day == now.day - 1) {
      text = "Hôm qua";
    } else {
      text = DateFormat('dd/MM/yyyy').format(date);
    }

    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 15),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: Colors.grey[800],
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  // --- HÀM XÁC NHẬN GIAO DỊCH (DÀNH CHO NGƯỜI BÁN) ---
  void _confirmOrder(dynamic msg, Map<String, dynamic> orderData) async {
    // Hiện loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
      ),
    );

    try {
      // Tính toán tổng tiền an toàn
      double totalPrice =
          ((orderData['price'] ?? 0) * (orderData['quantity'] ?? 1)).toDouble();

      // GỌI API THẬT QUA TRANSACTION SERVICE (ĐÃ CẬP NHẬT)
      bool isSuccess = await TransactionService.confirmTransaction(
        postId: orderData['postId'],
        buyerId: widget.partnerId,
        quantity: orderData['quantity'] ?? 1,
        totalPrice: totalPrice,
        messageId: msg['_id'],
      );

      // Đóng loading
      if (mounted) Navigator.pop(context);

      if (isSuccess) {
        setState(() {
          final index = messages.indexWhere((m) => m['_id'] == msg['_id']);
          if (index != -1) {
            Map<String, dynamic> updatedData = Map.from(orderData);
            updatedData['status'] = 'completed';
            messages[index]['content'] = jsonEncode(updatedData);
          }
        });

        //Gửi một tin nhắn thông báo tự động qua Socket để màn hình người mua cập nhật ngay lập tức
        _sendSocketMessage(
          " Mình đã xác nhận đơn hàng! Bạn kiểm tra nhé,",
          type: 'text',
        );

        // Thông báo thành công
        _showCustomSnackBar(
          "Giao dịch thành công! Đã lưu vào Lịch sử.",
          isSuccess: true,
        );
      } else {
        _showCustomSnackBar(
          "Xác nhận thất bại. Vui lòng thử lại sau!",
          isSuccess: false,
        );
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      print("Lỗi xác nhận đơn: $e");
      _showCustomSnackBar("Đã xảy ra lỗi kết nối.", isSuccess: false);
    }
  }

  // --- HÀM TỪ CHỐI GIAO DỊCH ---
  void _cancelOrder(dynamic msg, Map<String, dynamic> orderData) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
      ),
    );

    try {
      bool isSuccess = await TransactionService.cancelTransaction(msg['_id']);

      if (mounted) Navigator.pop(context);

      if (isSuccess) {
        setState(() {
          final index = messages.indexWhere((m) => m['_id'] == msg['_id']);
          if (index != -1) {
            Map<String, dynamic> updatedData = Map.from(orderData);
            updatedData['status'] = 'cancelled';
            messages[index]['content'] = jsonEncode(updatedData);
          }
        });

        // Bắn thông báo qua Socket cho người mua biết
        _sendSocketMessage(" Giao dịch đã bị hủy. Hẹn bạn dịp khác nhé!", type: 'text');
        
      } else {
        _showCustomSnackBar("Từ chối thất bại. Vui lòng thử lại!", isSuccess: false);
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      print("Lỗi hủy đơn: $e");
      _showCustomSnackBar("Đã xảy ra lỗi kết nối.", isSuccess: false);
    }
  }

  Widget _buildMessageItem(dynamic msg) {
    dynamic senderData = msg['sender'] ?? msg['senderId'];
    String senderId = (senderData is Map)
        ? senderData['_id'].toString()
        : senderData.toString();
    senderId = senderId.replaceAll('"', '').trim();
    String currentUserId = (myId ?? "").replaceAll('"', '').trim();
    bool isMe = (senderId == currentUserId);

    return _buildMessageBubble(
      msg['content'] ?? "",
      isMe,
      msg['createdAt'] ?? msg['timestamp'],
      status: msg['status'] ?? 'sent',
      msg: msg,
    );
  }

  Widget _buildMessageBubble(
    String content,
    bool isMe,
    String? timeStr, {
    String status = 'sent',
    dynamic msg,
  }) {
    String finalStatus = msg != null ? (msg['status'] ?? status) : status;
    bool isRevoked = (msg != null && msg['type'] == 'revoked');
    bool isEdited = (msg != null && msg['isEdited'] == true && !isRevoked);

    bool isOrder = (msg != null && msg['type'] == 'order');
    Map<String, dynamic>? orderData;
    if (isOrder) {
      try {
        orderData = jsonDecode(content);
      } catch (e) {
        print("Lỗi parse order data: $e");
      }
    }

    String formattedTime = "";
    if (timeStr != null) {
      try {
        formattedTime = DateFormat(
          'HH:mm',
        ).format(DateTime.parse(timeStr).toLocal());
      } catch (e) {}
    }

    return GestureDetector(
      onLongPress: () {
        if (msg != null && !isOrder) _showMessageOptions(msg, isMe);
      },
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Column(
          crossAxisAlignment: isMe
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 4),
              padding: isOrder
                  ? const EdgeInsets.all(5)
                  : const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isRevoked
                    ? Colors.grey.shade300
                    : (isMe ? const Color(0xFFB71C1C) : Colors.grey[200]),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(12),
                  topRight: const Radius.circular(12),
                  bottomLeft: isMe
                      ? const Radius.circular(12)
                      : const Radius.circular(0),
                  bottomRight: isMe
                      ? const Radius.circular(0)
                      : const Radius.circular(12),
                ),
                border: isRevoked
                    ? Border.all(color: Colors.grey.shade400)
                    : null,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // --- 1. HIỂN THỊ HÌNH ẢNH ---
                  if (msg != null && msg['type'] == 'image')
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => FullScreenImagePage(
                              imageUrl: content.startsWith('http')
                                  ? content
                                  : '$serverUrl$content',
                            ),
                          ),
                        );
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: CachedNetworkImage(
                          imageUrl: content.startsWith('http')
                              ? content
                              : '$serverUrl$content',
                          width: 200,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            width: 200,
                            height: 150,
                            color: Colors.grey[200],
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                          errorWidget: (context, url, error) =>
                              const Icon(Icons.error),
                        ),
                      ),
                    )
                  // --- 2. HIỂN THỊ THẺ ĐẶT HÀNG  ---
                  else if (isOrder && orderData != null)
                    Container(
                      width: 280, // Tăng nhẹ chiều ngang để chứa ảnh
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(
                                Icons.shopping_bag,
                                color: Color(0xFF1A237E),
                                size: 18,
                              ),
                              SizedBox(width: 8),
                              Text(
                                "YÊU CẦU ĐẶT HÀNG",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A237E),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          const Divider(),

                          // VÙNG HIỂN THỊ ẢNH VÀ THÔNG TIN SONG SONG
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Ảnh sản phẩm
                              if (orderData['image'] != null &&
                                  orderData['image'].toString().isNotEmpty)
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: CachedNetworkImage(
                                    imageUrl:
                                        orderData['image']
                                            .toString()
                                            .startsWith('http')
                                        ? orderData['image']
                                        : '$serverUrl${orderData['image']}',
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Container(
                                      width: 60,
                                      height: 60,
                                      color: Colors.grey[200],
                                      child: const Padding(
                                        padding: EdgeInsets.all(15),
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      ),
                                    ),
                                    errorWidget: (context, url, error) =>
                                        Container(
                                          width: 60,
                                          height: 60,
                                          color: Colors.grey[200],
                                          child: const Icon(
                                            Icons.image_not_supported,
                                            color: Colors.grey,
                                          ),
                                        ),
                                  ),
                                )
                              else
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: Colors.grey[200],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.shopping_bag,
                                    color: Colors.grey,
                                  ),
                                ),

                              const SizedBox(width: 10),

                              // Thông tin sản phẩm bên cạnh
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      orderData['title'] ?? "Sản phẩm",
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: Colors.black87,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      "Đơn giá: ${_formatCurrency(orderData['price'])}",
                                      style: const TextStyle(
                                        color: Colors.grey,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      "Số lượng: ${orderData['quantity']}",
                                      style: const TextStyle(
                                        color: Colors.black87,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  "Tổng cộng:",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  _formatCurrency(
                                    (orderData['price'] ?? 0) *
                                        (orderData['quantity'] ?? 1),
                                  ),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Nút Xác nhận/Từ chối cho người Bán
                          if (!isMe) ...[
                            if (orderData['status'] == 'pending')
                              Row(
                                children: [
                                  // NÚT TỪ CHỐI
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () => _cancelOrder(msg, orderData!),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red.shade600,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      child: const Text(
                                        "Từ chối",
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10), // Khoảng cách giữa 2 nút
                                  // NÚT XÁC NHẬN
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () => _confirmOrder(msg, orderData!),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF059669),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      child: const Text(
                                        "Xác nhận",
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            else if (orderData['status'] == 'completed')
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  " Đã chốt đơn",
                                  style: TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              )
                            // THÊM TRẠNG THÁI TỪ CHỐI CHO NGƯỜI BÁN
                            else if (orderData['status'] == 'cancelled')
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  " Đã từ chối giao dịch",
                                  style: TextStyle(
                                    color: Colors.red.shade800,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ] else ...[
                            // GIAO DIỆN HIỂN THỊ DÀNH CHO NGƯỜI MUA
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: orderData['status'] == 'completed'
                                    ? Colors.green.shade100
                                    : (orderData['status'] == 'cancelled'
                                        ? Colors.red.shade50
                                        : Colors.orange.shade50),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                orderData['status'] == 'completed'
                                    ? " Giao dịch hoàn tất"
                                    : (orderData['status'] == 'cancelled'
                                        ? " Đơn hàng đã bị từ chối"
                                        : "⏳ Đang chờ người bán xác nhận"),
                                style: TextStyle(
                                  color: orderData['status'] == 'completed'
                                      ? Colors.green
                                      : (orderData['status'] == 'cancelled'
                                          ? Colors.red.shade800
                                          : Colors.orange.shade800),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    )
                  // --- 3. HIỂN THỊ TEXT BÌNH THƯỜNG ---
                  else
                    Text(
                      content,
                      style: TextStyle(
                        color: isRevoked
                            ? Colors.grey.shade600
                            : (isMe ? Colors.white : Colors.black87),
                        fontSize: 16,
                        fontStyle: isRevoked
                            ? FontStyle.italic
                            : FontStyle.normal,
                      ),
                    ),

                  if (isEdited)
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Text(
                        "(đã sửa)",
                        style: TextStyle(
                          fontSize: 10,
                          fontStyle: FontStyle.italic,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: isMe
                  ? MainAxisAlignment.end
                  : MainAxisAlignment.start,
              children: [
                if (isMe && !isRevoked)
                  Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Text(
                      finalStatus == 'sending' ? "Đang gửi..." : "Đã gửi",
                      style: TextStyle(
                        fontSize: 10,
                        fontStyle: FontStyle.italic,
                        color: finalStatus == 'sending'
                            ? Colors.grey
                            : Colors.grey[600],
                      ),
                    ),
                  ),
                Text(
                  formattedTime,
                  style: const TextStyle(color: Colors.grey, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (_isEditing)
          Container(
            color: Colors.grey.shade200,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.edit, size: 16, color: Color(0xFFB71C1C)),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    "Đang chỉnh sửa tin nhắn",
                    style: TextStyle(
                      color: Color(0xFFB71C1C),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: _cancelEditing,
                  child: const Icon(Icons.close, size: 20, color: Colors.grey),
                ),
              ],
            ),
          ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          color: Colors.white,
          child: Row(
            children: [
              if (!_isEditing)
                IconButton(
                  icon: const Icon(
                    Icons.add_circle,
                    color: Color(0xFFB71C1C),
                    size: 28,
                  ),
                  onPressed: _showAttachmentOptions,
                ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(25),
                    border: _isEditing
                        ? Border.all(color: const Color(0xFFB71C1C), width: 1)
                        : null,
                  ),
                  child: TextField(
                    controller: _msgController,
                    autofocus: _isEditing,
                    onChanged: (val) => _onTyping(),
                    decoration: InputDecoration(
                      hintText: _isEditing
                          ? "Nhập nội dung mới..."
                          : "Nhập tin nhắn...",
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _handleSendMessage,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: const BoxDecoration(
                    color: Color(0xFFB71C1C),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _isEditing ? Icons.check : Icons.send,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class FullScreenImagePage extends StatelessWidget {
  final String imageUrl;
  const FullScreenImagePage({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: PhotoView(imageProvider: CachedNetworkImageProvider(imageUrl)),
    );
  }
}
