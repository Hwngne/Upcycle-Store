import 'package:flutter/material.dart';

class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          stops: [0.0, 0.54, 1.0], // Các điểm dừng theo thiết kế
          colors: [
            Color(0xFFF3DDDD), // 0% - Hồng nhạt
            Color(0xFFFFFFFF), // 54% - Trắng
            Color(0xFFE5EFFF), // 100% - Xanh nhạt
          ],
        ),
      ),
      child: child, // Nội dung trang sẽ nằm đè lên nền này
    );
  }
}
