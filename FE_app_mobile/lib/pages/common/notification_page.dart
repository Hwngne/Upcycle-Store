import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import '../../services/notification_service.dart';
import 'package:bot_toast/bot_toast.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await NotificationService.fetchNotifications();
    if (mounted) {
      setState(() {
        _notifications = data;
        _isLoading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    bool success = await NotificationService.markAllAsRead();
    if (success) {
      BotToast.showCustomText(
        toastBuilder: (_) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.black87.withOpacity(0.8),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.check_circle, color: Colors.greenAccent, size: 22),
              SizedBox(width: 10),
              Text(
                "Đã đánh dấu đọc tất cả",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        align: const Alignment(0, 0.8),
        duration: const Duration(seconds: 2),
      );

      _loadData();
    }
  }

  // Hàm fomat thời gian từ chuỗi ISO của MongoDB
  String _formatTime(String? dateStr) {
    if (dateStr == null) return "Vừa xong";
    try {
      final date = DateTime.parse(dateStr).toLocal();
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) return "${diff.inMinutes} phút trước";
      if (diff.inHours < 24) return "${diff.inHours} giờ trước";
      return DateFormat('dd/MM/yyyy HH:mm').format(date);
    } catch (e) {
      return "Vừa xong";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Thông báo",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: Colors.white),
            onPressed: _markAllRead,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
          ? const Center(
              child: Text(
                "Bạn chưa có thông báo nào.",
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView.builder(
                padding: const EdgeInsets.all(15),
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final item = _notifications[index];
                  // Xử lý dữ liệu từ MongoDB
                  final bool isRead = item['isRead'] ?? false;
                  final String type = item['type'] ?? 'general';
                  final String title = item['title'] ?? 'Thông báo';
                  String message = item['message'] ?? '';
                  final String time = _formatTime(item['createdAt']);

                  // --- ĐOẠN CODE MỚI: Xử lý chuỗi JSON nếu có ---
                  if (message.trim().startsWith('{') &&
                      message.contains('"title"')) {
                    try {
                      Map<String, dynamic> orderData = jsonDecode(message);
                      if (orderData.containsKey('title')) {
                        message = " Đơn hàng: ${orderData['title']}";
                      }
                    } catch (e) {
                      // Nếu lỗi parse JSON thì giữ nguyên message gốc
                    }
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 15),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: isRead ? Colors.white : Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: _getIconColor(type).withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _getIcon(type),
                            color: _getIconColor(type),
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      title,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                        color: isRead
                                            ? Colors.black87
                                            : const Color(0xFF1A237E),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    time,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 5),
                              Text(
                                message,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey[700],
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'point':
        return Icons.diamond;
      case 'event':
        return Icons.calendar_month;
      case 'chat':
        return Icons.message;
      case 'gift': 
        return Icons.card_giftcard;
      default:
        return Icons.notifications;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'point':
        return Colors.amber;
      case 'event':
        return Colors.green;
      case 'chat':
        return Colors.blue;
      case 'gift':
        return Colors.purple;
      default:
        return const Color(0xFFB71C1C);
    }
  }
}
