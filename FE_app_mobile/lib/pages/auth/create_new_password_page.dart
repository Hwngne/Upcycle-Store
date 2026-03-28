import 'package:flutter/material.dart';
import 'package:bot_toast/bot_toast.dart';
import '../../services/auth_service.dart';

class CreateNewPasswordPage extends StatefulWidget {
  final String email;
  final String otp;
  const CreateNewPasswordPage({
    super.key,
    required this.email,
    required this.otp,
  });

  @override
  State<CreateNewPasswordPage> createState() => _CreateNewPasswordPageState();
}

class _CreateNewPasswordPageState extends State<CreateNewPasswordPage> {
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isObscure1 = true;
  bool _isObscure2 = true;

  // --- HÀM THÔNG BÁO ---
  void _showCustomSnackBar(String message, {bool isSuccess = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isSuccess
                  ? Icons.check_circle_rounded
                  : Icons.error_outline_rounded,
              color: Colors.white,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isSuccess
            ? const Color(0xFF059669)
            : Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        elevation: 6,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _submitNewPassword() async {
    final newPassword = _newPasswordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (newPassword.length < 8) {
      _showCustomSnackBar(
        "Mật khẩu phải dài ít nhất 8 ký tự!",
        isSuccess: false,
      );
      return;
    }

    if (newPassword != confirmPassword) {
      _showCustomSnackBar("Mật khẩu xác nhận không khớp!", isSuccess: false);
      return;
    }

    BotToast.showLoading();

    final result = await AuthService.resetPassword(
      widget.email,
      widget.otp,
      newPassword,
    );

    BotToast.closeAllLoading();

    if (result['success'] == true) {
      _showCustomSnackBar(result['message'], isSuccess: true);
      if (mounted) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } else {
      _showCustomSnackBar(result['message'], isSuccess: false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Tạo mật khẩu mới",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              "Vui lòng tạo mật khẩu mới để bảo vệ tài khoản của bạn.",
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 40),

            _buildModernTextField(
              controller: _newPasswordController,
              icon: Icons.lock_outline,
              hint: "Mật khẩu mới",
              isObscure: _isObscure1,
              onToggleVisibility: () =>
                  setState(() => _isObscure1 = !_isObscure1),
            ),
            const SizedBox(height: 20),

            _buildModernTextField(
              controller: _confirmPasswordController,
              icon: Icons.lock_reset,
              hint: "Xác nhận mật khẩu",
              isObscure: _isObscure2,
              onToggleVisibility: () =>
                  setState(() => _isObscure2 = !_isObscure2),
            ),

            const SizedBox(height: 40),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _submitNewPassword,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "Xác nhận đổi mật khẩu",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModernTextField({
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required bool isObscure,
    required VoidCallback onToggleVisibility,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        obscureText: isObscure,
        style: const TextStyle(fontSize: 16),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: Colors.grey[600]),
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey[500]),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 18,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              isObscure ? Icons.visibility_off : Icons.visibility,
              color: Colors.grey[500],
            ),
            onPressed: onToggleVisibility,
          ),
        ),
      ),
    );
  }
}
