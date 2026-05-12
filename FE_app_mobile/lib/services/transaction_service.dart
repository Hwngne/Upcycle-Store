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
    required String messageId,
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
          'messageId': messageId,
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
        throw Exception(
          "Failed to load transactions. Status code: ${response.statusCode}",
        );
      }
    } catch (e) {
      print("Lỗi khi tải lịch sử giao dịch: $e");
      return [];
    }
  }

  // 3. GỌI API ĐỂ NGƯỜI BÁN TỪ CHỐI ĐƠN HÀNG
  static Future<bool> cancelTransaction(String messageId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/cancel'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'messageId': messageId}),
      );

      print("Status Code Từ Chối Đơn: ${response.statusCode}");
      if (response.statusCode == 200) {
        return true;
      }
      return false;
    } catch (e) {
      print("Lỗi khi từ chối giao dịch: $e");
      return false;
    }
  }
}
