import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'user_service.dart';

class AuthService {
  // ⚠️ Đổi IP máy tính của bạn ở đây
  static const String baseUrl = "http://localhost:5000/api/users";

  // --- HÀM LẤY TOKEN (Private Helper) ---
  static Future<String> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_token') ?? '';
  }

  // --- 1. ĐĂNG NHẬP (Giữ nguyên logic của bạn) ---
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        Map<String, dynamic> userObj = (data['user'] != null)
            ? data['user']
            : data;

        String token = data['token'] ?? "";
        String role = userObj['role'] ?? "student";
        String name = userObj['name'] ?? "User";
        String userEmail = userObj['email'] ?? email;
        String avatar = userObj['avatar'] ?? "";

        await prefs.setString('user_token', token);
        await prefs.setBool('is_logged_in', true);
        await prefs.setString('user_email', userEmail);
        await prefs.setString('user_name', name);
        await prefs.setString('user_role', role);
        if (avatar.isNotEmpty) await prefs.setString('user_avatar', avatar);

        UserData.name = name;
        UserData.email = userEmail;
        UserData.role = role;
        UserData.avatar = avatar.isNotEmpty
            ? avatar
            : "https://i.pravatar.cc/300";
        UserData.rank = userObj['rank'] ?? 1;

        if (userObj['attendanceHistory'] != null) {
          UserData.attendanceHistory = List<String>.from(
            userObj['attendanceHistory'],
          );
        } else {
          UserData.attendanceHistory = [];
        }

        int spendingPoints = 0;
        if (userObj['points'] != null)
          spendingPoints = int.parse(userObj['points'].toString());
        else if (userObj['total_points'] != null)
          spendingPoints = int.parse(userObj['total_points'].toString());

        int rankingScore = (userObj['totalScore'] != null)
            ? int.parse(userObj['totalScore'].toString())
            : spendingPoints;

        UserData.points = spendingPoints;
        UserData.totalScore = rankingScore;

        await prefs.setInt('points_$userEmail', spendingPoints);

        return {
          'success': true,
          'role': role,
          'isFirstLogin': data['isFirstLogin'] ?? false,
        };
      }
      return {'success': false, 'message': 'Sai tài khoản hoặc mật khẩu'};
    } catch (e) {
      print("Lỗi Login: $e");
      return {'success': false, 'message': 'Lỗi kết nối'};
    }
  }

  static Future<Map<String, dynamic>?> dailyCheckIn() async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/attendance'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 ||
          (response.statusCode == 400 && data['attendanceHistory'] != null)) {
        if (data['newPoints'] != null)
          UserData.points = int.tryParse(data['newPoints'].toString()) ?? 0;
        if (data['attendanceHistory'] != null) {
          UserData.attendanceHistory = List<String>.from(
            data['attendanceHistory'],
          );
        }
        return data;
      }
      return null;
    } catch (e) {
      print("❌ Lỗi checkin: $e");
      return null;
    }
  }

  // --- 3. CỘNG ĐIỂM (Quiz, Đọc báo...) ---
  static Future<bool> addPoints(
    int points, {
    String taskName = "Nhiệm vụ",
  }) async {
    try {
      final token = await getToken();

      final response = await http.post(
        Uri.parse('$baseUrl/add-points'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'points': points, 'taskName': taskName}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        UserData.points = data['newPoints'];
        UserData.rank = data['newRank'];

        // Lưu cache để lần sau mở app thấy điểm luôn
        if (UserData.email != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setInt('points_${UserData.email}', UserData.points ?? 0);
        }

        return true;
      }
      return false;
    } catch (e) {
      print("Lỗi cộng điểm: $e");
      return false;
    }
  }

  // --- 4. CẬP NHẬT PROFILE ) ---
  static Future<bool> updateProfile({
    required String gender,
    required String phone,
    required String dateOfBirth,
    required String avatar,
  }) async {
    try {
      final token = await getToken();

      final response = await http.put(
        Uri.parse('$baseUrl/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'gender': gender,
          'phone': phone,
          'dateOfBirth': dateOfBirth,
          'avatar': avatar,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();

        UserData.gender = data['gender'];
        UserData.phone = data['phone'] ?? "";
        UserData.dateOfBirth = data['dateOfBirth'] ?? "";
        UserData.avatar = data['avatar'];

        await prefs.setString('user_phone', UserData.phone ?? "");
        await prefs.setString('user_avatar', UserData.avatar ?? "");
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // --- 5. LẤY BXH
  static Future<List<dynamic>> fetchLeaderboard() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/leaderboard'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print("Lỗi lấy BXH: $e");
    }
    return [];
  }

  // --- 6. AUTO LOGIN ---
  static Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('is_logged_in')) return false;

    // Load data từ Cache lên RAM
    UserData.name = prefs.getString('user_name');
    UserData.email = prefs.getString('user_email');
    UserData.role = prefs.getString('user_role');
    UserData.avatar =
        prefs.getString('user_avatar') ?? "https://i.pravatar.cc/300";
    UserData.points = prefs.getInt('points_${UserData.email}') ?? 0;

    return true;
  }

  // --- 7. ĐĂNG XUẤT ---
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // --- 8. ĐỔI MẬT KHẨU ---
  static Future<Map<String, dynamic>> changePassword(String newPassword) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/change-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'email': UserData.email, 'newPassword': newPassword}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'message': data['message'] ?? 'Thành công'};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Lỗi không xác định',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Lỗi kết nối: $e'};
    }
  }

  // --- BỔ SUNG: LẤY THÔNG TIN USER MỚI NHẤT ---
  static Future<Map<String, dynamic>?> fetchUserInfo() async {
    try {
      final token = await getToken();
      if (token.isEmpty) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // 1. CẬP NHẬT GLOBAL STATE
        UserData.name = data['name'];
        UserData.email = data['email'];
        UserData.role = data['role'];
        UserData.avatar = data['avatar'];
        UserData.phone = data['phone'];
        UserData.gender = data['gender'];
        UserData.dateOfBirth = data['dateOfBirth'];

        // Cập nhật Điểm & Rank
        UserData.points =
            int.tryParse(data['points'].toString()) ??
            int.tryParse(data['total_points'].toString()) ??
            0;

        UserData.totalScore = int.tryParse(data['totalScore'].toString()) ?? 0;
        UserData.rank = data['rank'];

        // Cập nhật Lịch sử điểm danh
        if (data['attendanceHistory'] != null) {
          UserData.attendanceHistory = List<String>.from(
            data['attendanceHistory'],
          );
        }

        return data;
      }
      return null;
    } catch (e) {
      print("❌ Lỗi lấy profile: $e");
      return null;
    }
  }
}
