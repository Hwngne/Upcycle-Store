import 'dart:convert';
import 'package:http/http.dart' as http;

class WasteService {
  static const String baseUrl = "http://localhost:5000/api/wastestations";

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
