import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'api_constrants.dart';

class EventService {
  static String get baseUrl => "${ApiConstants.baseUrl}/event-requests";
  static String get configUrl => "${ApiConstants.baseUrl}/config";

  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // --- GỬI YÊU CẦU TẠO SỰ KIỆN ---
  static Future<bool> createEvent(
    Map<String, dynamic> eventData,
    XFile? bannerFile,
    PlatformFile? attachmentFile,
  ) async {
    try {
      final token = await AuthService.getToken();
      final uri = Uri.parse('$baseUrl/create');
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer $token';
      eventData.forEach((key, value) {
        if (value != null) {
          if (value is List) {
            request.fields[key] = jsonEncode(value);
          } else {
            request.fields[key] = value.toString();
          }
        }
      });

      if (bannerFile != null) {
        final bytes = await bannerFile.readAsBytes();
        var multipartFile = http.MultipartFile.fromBytes(
          'banner',
          bytes,
          filename: bannerFile.name,
        );
        request.files.add(multipartFile);
      }

      if (attachmentFile != null) {
        if (attachmentFile.bytes != null) {
          var multipartFile = http.MultipartFile.fromBytes(
            'attachment',
            attachmentFile.bytes!,
            filename: attachmentFile.name,
          );
          request.files.add(multipartFile);
        } else if (attachmentFile.path != null) {
          var multipartFile = await http.MultipartFile.fromPath(
            'attachment',
            attachmentFile.path!,
          );
          request.files.add(multipartFile);
        }
      }

      // 5. Gửi request đi
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return true;
      } else {
        print("❌ Lỗi Server trả về: ${response.body}");
        return false;
      }
    } catch (e) {
      print("❌ Lỗi mạng hoặc kết nối: $e");
      return false;
    }
  }

  // --- LẤY DANH SÁCH CHỦ ĐỀ TỪ CONFIG ---
  static Future<List<String>> getTopics() async {
    try {
      final response = await http.get(
        Uri.parse("$configUrl?type=topic"),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => item['name'].toString()).toList();
      }
      return [];
    } catch (e) {
      print("Lỗi lấy topics: $e");
      return [];
    }
  }

  // --- LẤY DANH SÁCH SỰ KIỆN CỦA TÔI ---
  static Future<List<dynamic>> getMyEvents() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/my-events'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return [];
      }
    } catch (e) {
      print("Lỗi lấy danh sách sự kiện: $e");
      return [];
    }
  }

  // --- KIỂM TRA TÌNH TRẠNG KHẢ DỤNG KHUYẾN MÃI THEO THÁNG ---
  static Future<Map<String, int>> getPromotionAvailability(
    int month,
    int year,
  ) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/availability?month=$month&year=$year'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        Map<String, int> result = {};
        if (data['data'] != null) {
          (data['data'] as Map).forEach((k, v) {
            result[k.toString()] = int.parse(v.toString());
          });
        }
        return result;
      }
      return {};
    } catch (e) {
      print("Lỗi lấy lịch: $e");
      return {};
    }
  }

  // --- LẤY DANH SÁCH BANNER ---
  static Future<List<dynamic>> getBanners() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/banners'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print("Lỗi lấy banner: $e");
      return [];
    }
  }
}
