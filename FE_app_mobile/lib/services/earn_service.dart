import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_constrants.dart';

const String baseUrl = '${ApiConstants.baseUrl}/earn';

class EarnService {
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // --- 1. LẤY DANH SÁCH BÀI BÁO ---
  static Future<Map<String, dynamic>> getArticles() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/articles'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'articles': [], 'readToday': 0};
    } catch (e) {
      print("Lỗi lấy bài báo: $e");
      return {'articles': [], 'readToday': 0};
    }
  }

  // --- 2. LẤY CHI TIẾT QUIZ ---
  static Future<Map<String, dynamic>> getQuizDetail(String quizId) async {
    try {
      // Gọi list về và lọc
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List quizzes = data['quizzes'] ?? [];

        // Tìm quiz khớp ID
        final quiz = quizzes.firstWhere((q) {
          String qId = q['_id'] is Map
              ? q['_id']['\$oid']
              : q['_id'].toString();
          return qId == quizId;
        }, orElse: () => null);

        if (quiz != null) return quiz;
      }
      throw Exception("Không tìm thấy nội dung Quiz.");
    } catch (e) {
      print("Lỗi getQuizDetail: $e");
      rethrow;
    }
  }

  // --- 3. LẤY DANH SÁCH QUIZ ---
  static Future<Map<String, dynamic>> getQuizzes() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/quizzes'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'quizzes': [], 'doneToday': 0};
    } catch (e) {
      print("Lỗi lấy Quiz: $e");
      return {'quizzes': [], 'doneToday': 0};
    }
  }

  // --- 4. NHẬN ĐIỂM BÀI BÁO ---
  static Future<Map<String, dynamic>> claimArticlePoints(
    String articleId,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/article'),
        headers: await _getHeaders(),
        body: jsonEncode({"articleId": articleId}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? "Lỗi nhận điểm");
      }
    } catch (e) {
      print("Lỗi claim article: $e");
      rethrow;
    }
  }

  // --- 5. NHẬN ĐIỂM QUIZ ---
  static Future<Map<String, dynamic>?> claimQuiz(String quizId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/quiz'),
        headers: await _getHeaders(),
        body: jsonEncode({"quizId": quizId}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'newPoints': data['newPoints'],
          'pointsEarned': data['pointsEarned'],
        };
      } else {
        return {'success': false, 'message': data['message'] ?? 'Lỗi'};
      }
    } catch (e) {
      print("Lỗi claim quiz: $e");
      return null;
    }
  }

  // --- 6. LẤY DANH SÁCH VIDEO (Hàm mới thêm) ---
  static Future<Map<String, dynamic>> getVideos() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/videos'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'videos': [], 'doneToday': 0};
    } catch (e) {
      print("Error getting videos: $e");
      return {'videos': [], 'doneToday': 0};
    }
  }

  // THÊM HÀM NÀY: Gọi API nhận thưởng
  static Future<bool> claimVideoPoints(String videoId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/video/claim'),
        headers: await _getHeaders(),
        body: jsonEncode({"videoId": videoId}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return true; // Thành công
      } else {
        print("Lỗi claim video: ${data['message']}");
        return false;
      }
    } catch (e) {
      print("Error claiming video: $e");
      return false;
    }
  }

  static Future<bool> saveSpinResult(int points) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/spin'),
        headers: await _getHeaders(),
        body: jsonEncode({"points": points}),
      );

      if (response.statusCode == 200) {
        return true;
      }
      return false;
    } catch (e) {
      print("Lỗi save spin: $e");
      return false;
    }
  }
}
