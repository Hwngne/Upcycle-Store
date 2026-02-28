import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'api_constrants.dart';

// ==========================================
// 1. CLASS USERDATA (KHO DỮ LIỆU TOÀN CỤC)
// ==========================================
class UserData {
  static String? id;
  static String? token;
  static String? role;
  static String? email;
  static String? name;
  static String? avatar;
  static String? studentId;
  static String? phone;
  static String? gender;
  static String? dateOfBirth;
  static List<String> attendanceHistory = [];

  static int? points;
  static int? totalScore;
  static int? rank;

  static void clear() {
    id = null;
    token = null;
    role = null;
    email = null;
    name = null;
    avatar = null;
    points = null;
    studentId = null;
    phone = null;
    gender = null;
    dateOfBirth = null;
    totalScore = null;
    attendanceHistory = [];
  }
}

// ==========================================
// 2. CLASS USERSERVICE (XỬ LÝ LOGIC)
// ==========================================
class UserService {
  static const String baseUrl = "${ApiConstants.baseUrl}/users";

  static Future<void> fetchUserInfo() async {
    try {
      final data = await getUserProfile();

      if (data.isNotEmpty) {
        UserData.id = data['_id'];
        UserData.name = data['name'];
        UserData.email = data['email'];
        UserData.role = data['role'];
        UserData.avatar = data['avatar'];
        UserData.phone = data['phone'];
        UserData.studentId = data['studentId'];

        if (data['total_points'] != null) {
          UserData.points = int.tryParse(data['total_points'].toString());
        } else if (data['points'] != null) {
          UserData.points = int.tryParse(data['points'].toString());
        }
        if (data['rank'] != null) {
          UserData.rank = int.tryParse(data['rank'].toString());
        }

        if (data['attendanceHistory'] != null) {
          UserData.attendanceHistory = List<String>.from(
            data['attendanceHistory'],
          );
        }
      }
    } catch (e) {
      print("Lỗi đồng bộ UserData: $e");
    }
  }

  Future<bool> updateUserProfile(
    String dob,
    String gender,
    String phone,
  ) async {
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('$baseUrl/update-profile'); 

      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'dateOfBirth': dob,
          'gender': gender,
          'phone': phone,
        }),
      );

      if (response.statusCode == 200) {
        UserData.dateOfBirth = dob;
        UserData.gender = gender;
        UserData.phone = phone;
        return true;
      } else {
        print("Lỗi từ Server: ${response.body}");
        return false;
      }

    } catch (e) {
      print("Lỗi cập nhật hồ sơ: $e");
      return false;
    }
  }

  // Hàm gọi API lấy thông tin
  static Future<Map<String, dynamic>> getUserProfile() async {
    final token = await AuthService.getToken();

    final url = Uri.parse('$baseUrl/profile');

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      print('Failed to load profile: ${response.body}');
      return {};
    }
  }
}
