import 'dart:async';
import 'package:flutter/material.dart';
import '../services/event_service.dart';
import '../services/api_constrants.dart';

class BannerSlider extends StatefulWidget {
  const BannerSlider({super.key});

  @override
  State<BannerSlider> createState() => _BannerSliderState();
}

class _BannerSliderState extends State<BannerSlider> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _timer;
  List<dynamic> _banners = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBanners();
  }

  // Gọi API lấy ảnh thật
  Future<void> _fetchBanners() async {
    final data = await EventService.getBanners();
    if (mounted) {
      setState(() {
        _banners = data;
        _isLoading = false;

        if (_banners.isEmpty) {
          _banners = [
            {
              'bannerUrl':
                  "https://img.freepik.com/free-vector/flat-world-environment-day-illustration_23-2149368364.jpg",
            },
            {
              'bannerUrl':
                  "https://img.freepik.com/free-vector/hand-drawn-world-environment-day-illustration_23-2149376674.jpg",
            },
          ];
        }
      });
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_banners.isEmpty) return;
      if (_currentPage < _banners.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  // Hàm xử lý link ảnh
  String _getImageUrl(String url) {
    if (url.startsWith('http')) return url;
    String serverUrl = ApiConstants.serverUrl;
    return "$serverUrl/$url".replaceAll(RegExp(r'(?<!:)/{2,}'), '/');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        PageView.builder(
          controller: _pageController,
          itemCount: _banners.length,
          onPageChanged: (int page) {
            setState(() {
              _currentPage = page;
            });
          },
          itemBuilder: (context, index) {
            final banner = _banners[index];
            final imgUrl = _getImageUrl(banner['bannerUrl']);

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 5),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                image: DecorationImage(
                  image: NetworkImage(imgUrl),
                  fit: BoxFit.cover,
                  onError: (exception, stackTrace) {
                    // Xử lý khi lỗi ảnh
                  },
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
            );
          },
        ),
        // Indicator
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_banners.length, (index) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                height: 6,
                width: _currentPage == index ? 20 : 6,
                decoration: BoxDecoration(
                  color: _currentPage == index
                      ? Colors.white
                      : Colors.white.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}
