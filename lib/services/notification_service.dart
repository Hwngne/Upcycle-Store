import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_constrants.dart';

class NotificationService {
  static String get baseUrl => "${ApiConstants.baseUrl}/api/notifications";

  static ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);

  // Lấy danh sách thông báo
  static Future<List<dynamic>> fetchNotifications() async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print("Lỗi tải thông báo: $e");
      return [];
    }
  }

  // Đánh dấu đã đọc tất cả
  static Future<bool> markAllAsRead() async {
    try {
      final token = await AuthService.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/read-all'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        unreadCountNotifier.value = 0;
        return true;
      }
      return false;
    } catch (e) {
      print("Lỗi mark read: $e");
      return false;
    }
  }

  // Lấy số lượng thông báo chưa đọc
  static Future<int> getUnreadCount() async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/unread-count'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        int count = data['unreadCount'] ?? 0;

        unreadCountNotifier.value = count;

        return count;
      }
      return 0;
    } catch (e) {
      print("Lỗi lấy số đếm thông báo: $e");
      return 0;
    }
  }
}
