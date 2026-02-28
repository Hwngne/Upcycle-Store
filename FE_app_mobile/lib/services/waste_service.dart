import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_constrants.dart';

class WasteService {
  static const String baseUrl = "${ApiConstants.baseUrl}/wastestations";

  static Future<List<dynamic>> fetchStations() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));

      if (response.statusCode == 200) {
        print("Lấy dữ liệu trạm rác thành công!");
        return jsonDecode(response.body);
      } else {
        print(" Lỗi Server: ${response.statusCode}");
        return [];
      }
    } catch (e) {
      print(" Lỗi mạng khi lấy trạm rác: $e");
      return [];
    }
  }
}
