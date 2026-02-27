import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/earn_service.dart';
import '../common/quizz_page.dart';

class NewsDetailPage extends StatefulWidget {
  final String id;
  final String title;
  final String content;
  final String imageUrl;
  final String displayType;
  final int readingTime;
  final int bonusPoints;
  final String? quizId;

  const NewsDetailPage({
    super.key,
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
    required this.displayType,
    this.readingTime = 15,
    this.bonusPoints = 0,
    this.quizId,
  });

  @override
  State<NewsDetailPage> createState() => _NewsDetailPageState();
}

class _NewsDetailPageState extends State<NewsDetailPage> {
  Timer? _timer;
  late int _remainingTime;
  bool _canInteract = false;
  bool _isProcessing = false;

  // --- 1. BIẾN KIỂM TRA TRẠNG THÁI QUIZ ---
  bool _isQuizAvailable = true;
  bool _checkingQuiz = false;

  final ScrollController _scrollController = ScrollController();
  bool _hasScrolledToBottom = false;

  @override
  void initState() {
    super.initState();
    _remainingTime = widget.readingTime;

    _scrollController.addListener(_scrollListener);

    if (widget.displayType == "hunt") {
      _startTimer();
    } else {
      // --- 2. GỌI HÀM CHECK QUIZ NẾU LÀ HOME  ---
      _checkQuizStatus();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients &&
          _scrollController.position.maxScrollExtent <= 0) {
        setState(() {
          _hasScrolledToBottom = true;
          _checkInteractionCondition();
        });
      }
    });
  }

  // --- 3. HÀM KIỂM TRA QUIZ TỒN TẠI/PUBLIC KHÔNG (MỚI) ---
  Future<void> _checkQuizStatus() async {
    if (widget.quizId == null || widget.quizId!.isEmpty) {
      if (mounted) setState(() => _isQuizAvailable = false);
      return;
    }

    setState(() => _checkingQuiz = true);

    try {
      await EarnService.getQuizDetail(widget.quizId!);

      if (mounted) {
        setState(() {
          _isQuizAvailable = true;
          _checkingQuiz = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isQuizAvailable = false;
          _checkingQuiz = false;
        });
      }
    }
  }

  void _scrollListener() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 50) {
      if (!_hasScrolledToBottom) {
        setState(() {
          _hasScrolledToBottom = true;
          _checkInteractionCondition();
        });
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingTime > 0) {
        if (mounted) setState(() => _remainingTime--);
      } else {
        if (mounted) {
          setState(() {
            _timer?.cancel();
            _checkInteractionCondition();
          });
        }
      }
    });
  }

  void _checkInteractionCondition() {
    if (widget.displayType == "home") {
      if (_hasScrolledToBottom && _isQuizAvailable) {
        _canInteract = true;
      }
    } else {
      if (_remainingTime == 0 && _hasScrolledToBottom) {
        _canInteract = true;
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _onButtonPress() {
    if (widget.displayType == "home") {
      _goToQuiz();
    } else {
      _claimPoints();
    }
  }

  void _goToQuiz() {
    // Check lại lần nữa cho chắc
    if (_isQuizAvailable && widget.quizId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) =>
              QuizPage(quizId: widget.quizId!, title: "Quiz: ${widget.title}"),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Bài viết này chưa có Quiz!")),
      );
    }
  }

  Future<void> _claimPoints() async {
    setState(() => _isProcessing = true);
    try {
      await EarnService.claimArticlePoints(widget.id);
      if (mounted) {
        _showRewardDialog(widget.bonusPoints);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll("Exception: ", "")),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isButtonEnabled = false;

    if (widget.displayType == "home") {
      isButtonEnabled = !_checkingQuiz && _isQuizAvailable && _canInteract;
    } else {
      isButtonEnabled = _canInteract;
    }

    if (_isProcessing) isButtonEnabled = false;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.imageUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(15),
                      child: Image.network(
                        widget.imageUrl,
                        width: double.infinity,
                        height: 200,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) =>
                            Container(height: 200, color: Colors.grey[300]),
                      ),
                    ),
                  const SizedBox(height: 20),
                  Text(
                    widget.title,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    widget.content.isNotEmpty
                        ? widget.content
                        : "Nội dung đang cập nhật...",
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),

          // --- CONTAINER CHỨA NÚT ---
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 5,
                  offset: Offset(0, -3),
                ),
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: isButtonEnabled ? _onButtonPress : null,

                style: ElevatedButton.styleFrom(
                  backgroundColor: widget.displayType == "home"
                      ? const Color(0xFFD32F2F)
                      : Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  disabledBackgroundColor: Colors.grey.shade400,
                ),
                child: _isProcessing || _checkingQuiz
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(color: Colors.white),
                      )
                    : Text(
                        _getButtonLabel(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showRewardDialog(int points) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFFFF0F0), Colors.white],
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.diamond,
                color: Colors.amber,
                size: 60,
              ), // Icon Kim cương
              const SizedBox(height: 10),
              const Text("Đọc báo xanh", style: TextStyle(color: Colors.grey)),
              Text(
                "+$points",
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C2C54),
                ),
              ),
              const SizedBox(height: 20),

              // Nút bấm
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context, true);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 30,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  "Nhận điểm",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- 4. CẬP NHẬT LOGIC HIỂN THỊ TEXT NÚT  ---
  String _getButtonLabel() {
    if (widget.displayType == "home") {
      if (_checkingQuiz) return "Đang kiểm tra...";

      if (!_isQuizAvailable) return "Bài viết này chưa có bài kiểm tra";

      return _canInteract
          ? "Làm bài Quiz ngay >>"
          : "Hãy đọc hết bài viết nhé !";
    } else {
      if (_remainingTime > 0) {
        return "Đọc tiếp (${_remainingTime}s)";
      } else if (!_hasScrolledToBottom) {
        return "Hãy đọc hết bài viết";
      } else {
        return "Nhận +${widget.bonusPoints} điểm";
      }
    }
  }
}
