import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_constrants.dart'; 

const String baseUrl = '${ApiConstants.baseUrl}/transactions';

class TransactionService {
  // 1. GỌI API ĐỂ NGƯỜI BÁN XÁC NHẬN CHỐT ĐƠN
  static Future<bool> confirmTransaction({
    required String postId,
    required String buyerId,
    required int quantity,
    required double totalPrice,
  }) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/confirm'), // Sẽ gọi đến: /api/transactions/confirm
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'postId': postId,
          'buyerId': buyerId,
          'quantity': quantity,
          'totalPrice': totalPrice,
        }),
      );

      print("Status Code Xác Nhận Đơn: ${response.statusCode}");
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      return false;
    } catch (e) {
      print("Lỗi khi xác nhận giao dịch: $e");
      return false;
    }
  }

  // 2. GỌI API LẤY LỊCH SỬ GIAO DỊCH C2C CỦA USER
  static Future<List<dynamic>> getTransactionHistory(String userId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/history/$userId'), 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception("Failed to load transactions. Status code: ${response.statusCode}");
      }
    } catch (e) {
      print("Lỗi khi tải lịch sử giao dịch: $e");
      return [];
    }
  }
}