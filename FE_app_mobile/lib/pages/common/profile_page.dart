import 'package:flutter/material.dart';
import '../../components/app_background.dart';
import '../common/edit_profile_page.dart';
import 'redeem_points_page.dart';
import '../common/my_posts_page.dart';
import '../common/transaction_history_page.dart';
import '../common/earn_points_page.dart';
import '../../services/auth_service.dart';
import '../../services/user_service.dart';
import '../auth/splash_page.dart';
import '../club/event_management.dart';


class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  // Biến lưu dữ liệu profile
  Map<String, dynamic>? _userProfile;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchUserProfile(); // Gọi API ngay khi mở màn hình
  }

  // Hàm gọi API lấy dữ liệu
  Future<void> _fetchUserProfile() async {
    try {
      final data = await UserService.getUserProfile();
      if (mounted) {
        setState(() {
          _userProfile = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
      print("Lỗi lấy profile: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final double screenHeight = MediaQuery.of(context).size.height;

    // Hiển thị Loading (Giữ màn hình trắng hoặc hiện quay vòng ở giữa)
    if (_isLoading) {
      return Scaffold(
        body: AppBackground(
          child: const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      );
    }

    // Hiển thị Lỗi (Có nút thử lại)
    if (_errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Lỗi kết nối: $_errorMessage"),
              ElevatedButton(
                onPressed: _fetchUserProfile,
                child: const Text("Thử lại"),
              ),
            ],
          ),
        ),
      );
    }

    // Lấy dữ liệu từ API trả về (Fallback nếu null)
    final String name = _userProfile?['name'] ?? "Sinh viên";
    final String role = _userProfile?['role'] ?? "student";
    final String avatarUrl =
        _userProfile?['avatar'] ?? "https://i.pravatar.cc/300";

    // Logic hiển thị vai trò (nếu cần hiển thị tiếng Việt đẹp hơn)
    final String displayRole = role == 'club' ? "Câu lạc bộ" : "Sinh viên";

    return Scaffold(
      backgroundColor: Colors.transparent, // Để lộ nền phía sau nếu có
      body: AppBackground(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // 1. HEADER (Màu đỏ + Avatar) - GIỮ NGUYÊN GIAO DIỆN CŨ
              Container(
                height: screenHeight * 0.35,
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Color(0xFFB71C1C),
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(30),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: CircleAvatar(
                        radius: 50,
                        backgroundImage: NetworkImage(avatarUrl),
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      name.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      displayRole, // Hiển thị role lấy từ API
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),

              // 2. BODY (Menu chức năng) - GIỮ NGUYÊN GIAO DIỆN CŨ
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
                child: Column(
                  children: [
                    _buildMenuItem(
                      context,
                      "Chỉnh sửa hồ sơ",
                      Icons.arrow_forward_ios,
                    ),
                    _buildMenuItem(
                      context,
                      "Đổi điểm tích lũy",
                      Icons.arrow_forward_ios,
                    ),
                    _buildMenuItem(
                      context,
                      "Bài đăng của tôi",
                      Icons.arrow_forward_ios,
                    ),

                    // Logic ẩn hiện mục CLB (Sử dụng biến role lấy từ API)
                    if (role == 'club')
                      _buildMenuItem(
                        context,
                        "Quản lý sự kiện",
                        Icons.arrow_forward_ios,
                        textColor: const Color(0xFFB71C1C), // Highlight cho CLB
                        iconColor: const Color(0xFFB71C1C),
                      ),

                    _buildMenuItem(
                      context,
                      "Lịch sử giao dịch",
                      Icons.arrow_forward_ios,
                    ),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Divider(thickness: 1, color: Colors.black12),
                    ),

                    _buildMenuItem(
                      context,
                      "Đăng xuất",
                      Icons.logout,
                      textColor: Colors.red,
                      iconColor: Colors.red,
                      isLogout: true,
                    ),

                    const SizedBox(height: 10),
                    _buildMenuItem(
                      context,
                      "Săn điểm tích lũy",
                      Icons.arrow_forward_ios,
                    ),
                    _buildMenuItem(
                      context,
                      "Xóa tài khoản",
                      Icons.arrow_forward_ios,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 50),
            ],
          ),
        ),
      ),
    );
  }

  // Widget Menu Item - ĐÃ KHÔI PHỤC VỀ GIAO DIỆN CŨ
  Widget _buildMenuItem(
    BuildContext context,
    String title,
    IconData icon, {
    Color textColor = Colors.black87,
    Color iconColor = Colors.black54,
    bool isLogout = false,
  }) {
    return InkWell(
      onTap: () async {
        if (title == "Chỉnh sửa hồ sơ") {
          // Chuyển sang trang Edit và reload lại khi quay về
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const EditProfilePage()),
          );
          _fetchUserProfile();
        } else if (title == "Đổi điểm tích lũy") {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const RedeemPointsPage()),
          );
        } else if (title == "Bài đăng của tôi") {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const MyPostsPage()),
          );
        } else if (title == "Quản lý sự kiện") {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const EventManagementPage(),
            ),
          );
        } else if (title == "Lịch sử giao dịch") {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const TransactionHistoryPage(),
            ),
          );
        } else if (title == "Săn điểm tích lũy") {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const EarnPointsPage()),
          );
        } else if (title == "Xóa tài khoản") {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Tính năng đang phát triển")),
          );
        } else if (isLogout) {
          bool? confirm = await showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text("Xác nhận"),
              content: const Text("Bạn có chắc chắn muốn đăng xuất không?"),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text("Hủy"),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text(
                    "Đăng xuất",
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              ],
            ),
          );

          if (confirm == true) {
            await AuthService.logout();
            if (!context.mounted) return;
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const SplashPage()),
              (route) => false,
            );
          }
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Colors.transparent)),
        ),
        // SỬ DỤNG ROW VỚI MAINAXISALIGNMENT.SPACEBETWEEN NHƯ CŨ
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: textColor,
              ),
            ),
            Icon(icon, size: 16, color: iconColor),
          ],
        ),
      ),
    );
  }
}
