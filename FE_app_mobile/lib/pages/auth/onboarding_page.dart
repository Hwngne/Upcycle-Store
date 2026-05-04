import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart'; 
import 'login_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> onboardingData = [
    {
      "title": "Phân Loại Rác Cùng AI",
      "description":
          "Sử dụng công nghệ trí tuệ nhân tạo để nhận diện rác thải trong tích tắc. Cùng UpcycleStore kiến tạo môi trường học tập xanh tại Văn Lang!",
      "image": "https://res.cloudinary.com/dl4vyi8yx/image/upload/v1777876229/onboarding_1_z8nolm.png", 
    },
    {
      "title": "Tích Điểm & Đổi Quà",
      "description":
          "Tham gia diễn đàn trao đổi đồ tái chế, hoàn thành nhiệm vụ mỗi ngày để tích lũy điểm thưởng và nhận những phần quà hấp dẫn.",
      "image": "https://res.cloudinary.com/dl4vyi8yx/image/upload/v1777876236/onboarding_2_r0go6q.png", 
    },
  ];

  // Hàm hoàn thành Onboarding và chuyển sang trang Login
  void _finishOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_onboarding', true);

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Nút Bỏ qua
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _finishOnboarding,
                child: const Text(
                  "Bỏ qua",
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

            // Phần hiển thị nội dung trượt
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemCount: onboardingData.length,
                itemBuilder: (context, index) {
                  final screenHeight = MediaQuery.of(context).size.height;

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40.0),
                    child: Center(
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Thay Image.asset thành CachedNetworkImage
                            CachedNetworkImage(
                              imageUrl: onboardingData[index]["image"]!,
                              height: screenHeight * 0.35,
                              fit: BoxFit.contain,
                              // Hiển thị vòng xoay trong lúc chờ tải ảnh từ mạng
                              placeholder: (context, url) => SizedBox(
                                height: screenHeight * 0.35,
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    color: Color(0xFFB71C1C),
                                  ),
                                ),
                              ),
                              // Widget hiển thị khi tải ảnh thất bại
                              errorWidget: (context, url, error) {
                                return Container(
                                  height: screenHeight * 0.25,
                                  width: screenHeight * 0.25,
                                  decoration: BoxDecoration(
                                    color: Colors.red[50],
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.image_not_supported,
                                    size: 50,
                                    color: Color(0xFFB71C1C),
                                  ),
                                );
                              },
                            ),

                            // Khoảng trống động (5% màn hình)
                            SizedBox(height: screenHeight * 0.05),

                            // Tiêu đề
                            Text(
                              onboardingData[index]["title"]!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFB71C1C),
                              ),
                            ),

                            // Khoảng trống động (2% màn hình)
                            SizedBox(height: screenHeight * 0.02),

                            // Mô tả
                            Text(
                              onboardingData[index]["description"]!,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Phần Bottom (Chấm tròn & Nút bấm)
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Các chấm tròn Indicator
                  Row(
                    children: List.generate(
                      onboardingData.length,
                      (index) => buildDot(index, context),
                    ),
                  ),

                  // Nút bấm Tiếp tục / Bắt đầu ngay
                  ElevatedButton(
                    onPressed: () {
                      if (_currentPage == onboardingData.length - 1) {
                        _finishOnboarding();
                      } else {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeIn,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB71C1C),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _currentPage == onboardingData.length - 1
                          ? "Bắt đầu ngay"
                          : "Tiếp tục",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Widget tạo chấm tròn chuyển trang
  Widget buildDot(int index, BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(right: 8),
      height: 10,
      width: _currentPage == index ? 24 : 10,
      decoration: BoxDecoration(
        color: _currentPage == index
            ? const Color(0xFFB71C1C)
            : Colors.grey[300],
        borderRadius: BorderRadius.circular(10),
      ),
    );
  }
}