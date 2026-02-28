import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class AiService {
  // CÔNG TẮC: Chuyển thành 'true' khi  làm xong Server
  static const bool useRealApi = false;

  //  Nơi dán URL API sau này
  static const String apiUrl = "https://your-ai-server.com/api/v1/scan";

  // --- HÀM GỌI CHÍNH TỪ GIAO DIỆN ---
  static Future<Map<String, dynamic>?> scanWaste(XFile imageFile) async {
    if (useRealApi) {
      return await _callRealApi(imageFile);
    } else {
      return await _callMockApi();
    }
  }

  // --- 1. HÀM GỌI API THẬT  ---
  static Future<Map<String, dynamic>?> _callRealApi(XFile imageFile) async {
    try {
      var request = http.MultipartRequest('POST', Uri.parse(apiUrl));

      if (kIsWeb) {
        final bytes = await imageFile.readAsBytes();
        request.files.add(
          http.MultipartFile.fromBytes(
            'image',
            bytes,
            filename: imageFile.name,
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('image', imageFile.path),
        );
      }

      // Gửi Request lên Server
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      // Xử lý kết quả trả về
      if (response.statusCode == 200) {
        final decodedData = jsonDecode(response.body);

        // vd: JSON trả về có dạng: { "success": true, "data": { ... } }
        if (decodedData['success'] == true) {
          return decodedData['data'];
        }
      }

      print("Lỗi API AI: ${response.statusCode} - ${response.body}");
      return null;
    } catch (e) {
      print("Lỗi kết nối AI Service: $e");
      return null;
    }
  }

  // --- 2.  (MOCK DATA) ---
  static Future<Map<String, dynamic>> _callMockApi() async {
    await Future.delayed(const Duration(seconds: 3));

    return {
      "itemName": "Chai nhựa PET",
      "category": "Rác tái chế",
      "confidence": 0.98,
      "suggestion":
          "Hãy đổ hết nước, súc sạch và làm bẹp chai trước khi bỏ vào thùng rác màu cam nhé!",
      "points": 15,
    };
  }
}
