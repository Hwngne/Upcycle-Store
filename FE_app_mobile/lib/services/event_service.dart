import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'api_constrants.dart';

class EventService {
  static String get baseUrl => "${ApiConstants.baseUrl}/event-requests";
  static String get configUrl => "${ApiConstants.baseUrl}/config";
  static String get newClubEventUrl => "${ApiConstants.baseUrl}/events";

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

      // SỬ DỤNG ĐƯỜNG DẪN MỚI TẠI ĐÂY
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
        print(" Lỗi Server trả về: ${response.body}");
        return false;
      }
    } catch (e) {
      print(" Lỗi mạng hoặc kết nối: $e");
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

  // --- HÀM ĐĂNG KÝ SỰ KIỆN ---
  static Future<bool> registerEvent(String eventId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$eventId/register'),
        headers: await _getHeaders(),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print("Lỗi đăng ký: $e");
      return false;
    }
  }

  // --- HÀM LẤY DANH SÁCH SINH VIÊN ĐĂNG KÝ SỰ KIỆN ---
  static Future<List<dynamic>> getEventParticipants(String eventId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$eventId/participants'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true) {
          return responseData['data']; // Trả về mảng danh sách sinh viên
        }
      }
      throw Exception('Failed to load participants');
    } catch (e) {
      print('Error in getEventParticipants: $e');
      return []; // Trả về mảng rỗng nếu lỗi
    }
  }

  // --- HÀM GỬI ẢNH QR LÊN BACKEND ĐỂ ĐIỂM DANH ---
  static Future<Map<String, dynamic>> checkInWithQRImage(
    XFile imageFile,
  ) async {
    try {
      final token = await AuthService.getToken();

      // Trỏ đến endpoint vừa tạo ở Backend
      final uri = Uri.parse('$baseUrl/check-in-qr');

      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer $token';

      // Đính kèm file ảnh với key là 'qrImage' khớp với multer ở Backend
      var multipartFile = await http.MultipartFile.fromPath(
        'qrImage',
        imageFile.path,
      );
      request.files.add(multipartFile);

      // Gửi request
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      // Xử lý kết quả trả về
      if (response.statusCode == 200 ||
          response.statusCode == 400 ||
          response.statusCode == 404) {
        // Dùng utf8.decode để đảm bảo Tiếng Việt (tên sinh viên) không bị lỗi font
        final responseBody = utf8.decode(response.bodyBytes);
        return jsonDecode(responseBody);
      } else {
        return {
          "success": false,
          "message": "Lỗi máy chủ (${response.statusCode})",
        };
      }
    } catch (e) {
      print("Lỗi checkInWithQRImage: $e");
      return {"success": false, "message": "Lỗi kết nối mạng hoặc timeout."};
    }
  }

  // --- HÀM ĐIỂM DANH BẰNG TEXT (SIÊU TỐC) ---
  static Future<Map<String, dynamic>> checkInWithQRText(String qrText) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/check-in-qr-text'), 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'qrText': qrText,
        }),
      );

      final responseBody = utf8.decode(response.bodyBytes);
      return jsonDecode(responseBody);
      
    } catch (e) {
      print("Lỗi Check-in QR Text: $e");
      return {"success": false, "message": "Lỗi kết nối máy chủ"};
    }
  }

  // --- HÀM LẤY DANH SÁCH SỰ KIỆN MÀ TÔI ĐÃ ĐĂNG KÝ ---
  static Future<List<dynamic>> getMyRegisteredEvents() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/my-tickets'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true) {
          return responseData['data'];
        }
      }
      return [];
    } catch (e) {
      print('Lỗi getMyRegisteredEvents: $e');
      return [];
    }
  }
}
