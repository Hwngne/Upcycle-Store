import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../components/mobile_layout.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _passController = TextEditingController();
  final _confirmController = TextEditingController();

  // Trạng thái ẩn/hiện mật khẩu cho từng ô
  bool _obscureNewPass = true;
  bool _obscureConfirmPass = true;

  bool _isLoading = false;

  void _handleChangePassword() async {
    // 1. Validate phía App trước cho nhanh
    if (_passController.text.isEmpty) {
      _showMessage("Vui lòng nhập mật khẩu mới", Colors.orange);
      return;
    }
    if (_passController.text.length < 8) {
      _showMessage("Mật khẩu phải từ 8 ký tự trở lên", Colors.orange);
      return;
    }
    if (_passController.text != _confirmController.text) {
      _showMessage("Mật khẩu nhập lại không khớp", Colors.red);
      return;
    }

    setState(() => _isLoading = true);

    // 2. Gọi API
    final result = await AuthService.changePassword(_passController.text);

    setState(() => _isLoading = false);

    // 3. Xử lý kết quả
    if (result['success'] == true) {
      // Thành công -> Vào trang chủ
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const MobileLayout()),
        (route) => false,
      );
      _showMessage("Đổi mật khẩu thành công!", Colors.green);
    } else {
      // Thất bại -> Hiện lỗi cụ thể từ Server
      _showMessage(result['message'], Colors.red);
    }
  }

  void _showMessage(String message, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message), backgroundColor: color));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Đổi mật khẩu lần đầu",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false, // Không cho back lại
        backgroundColor: Colors.white,
        elevation: 0,
        titleTextStyle: const TextStyle(color: Color(0xFF2C2C54), fontSize: 20),
      ),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Icon ổ khóa
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5FA),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.lock_reset,
                size: 60,
                color: Color(0xFFB71C1C),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              "Bảo mật tài khoản",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2C2C54),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              "Vì lý do an toàn, vui lòng đổi mật khẩu mới cho lần đăng nhập đầu tiên.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], height: 1.5),
            ),
            const SizedBox(height: 40),

            // Ô nhập mật khẩu mới
            _buildPasswordField(
              controller: _passController,
              label: "Mật khẩu mới (tối thiểu 8 ký tự)",
              isObscure: _obscureNewPass,
              onToggle: () =>
                  setState(() => _obscureNewPass = !_obscureNewPass),
            ),

            const SizedBox(height: 20),

            // Ô nhập lại mật khẩu
            _buildPasswordField(
              controller: _confirmController,
              label: "Nhập lại mật khẩu",
              isObscure: _obscureConfirmPass,
              onToggle: () =>
                  setState(() => _obscureConfirmPass = !_obscureConfirmPass),
            ),

            const SizedBox(height: 40),

            // Nút Xác nhận
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleChangePassword,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  elevation: 5,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        "XÁC NHẬN & VÀO APP",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Widget TextField dùng chung có icon Mắt
  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required bool isObscure,
    required VoidCallback onToggle,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5FA),
        borderRadius: BorderRadius.circular(15),
      ),
      child: TextField(
        controller: controller,
        obscureText: isObscure,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.grey[600]),
          prefixIcon: const Icon(
            Icons.vpn_key_outlined,
            color: Color(0xFF2C2C54),
          ),
          suffixIcon: IconButton(
            icon: Icon(
              isObscure ? Icons.visibility_off : Icons.visibility,
              color: Colors.grey,
            ),
            onPressed: onToggle,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 15,
          ),
        ),
      ),
    );
  }
}
