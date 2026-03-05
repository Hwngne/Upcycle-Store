import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_constrants.dart';

class GiftService {
  static const String baseUrl = ApiConstants.baseUrl;

  // 1. Lấy danh sách quà
  Future<List<dynamic>> fetchGifts() async {
    final url = Uri.parse('$baseUrl/gifts');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Lỗi tải dữ liệu');
      }
    } catch (e) {
      print('Lỗi fetchGifts: $e');
      return [];
    }
  }

  // 2. Đổi quà
  Future<Map<String, dynamic>> redeemGift(String giftId) async {
    final url = Uri.parse('$baseUrl/gifts/redeem');
    final String? token = await AuthService.getToken();

    if (token == null || token.isEmpty) {
      return {
        'success': false,
        'message': 'Bạn chưa đăng nhập. Hãy đăng nhập lại!',
      };
    }

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'giftId': giftId}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Đổi quà thành công!',
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Đổi quà thất bại',
        };
      }
    } catch (e) {
      print('Lỗi redeemGift: $e');
      return {'success': false, 'message': 'Lỗi kết nối server'};
    }
  }

  // 3. Lấy lịch sử giao dịch
  Future<List<dynamic>> fetchHistory() async {
    final url = Uri.parse('$baseUrl/gifts/history');
    final String? token = await AuthService.getToken();
    if (token == null) return [];

    try {
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        // Trả về danh sách gốc từ Server
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Lỗi fetchHistory: $e');
    }
    return [];
  }
}
