import 'package:flutter/material.dart';
import '../../data/mock_data.dart';
import '../../services/earn_service.dart';

class QuizPage extends StatefulWidget {
  // Cho phép null (Đã xóa từ khóa required)
  final dynamic quizData;
  final String? quizId;
  final String title;

  const QuizPage({
    super.key,
    this.quizData, // Không bắt buộc
    this.quizId, // Nhận thêm ID
    this.title = "Quiz",
  });

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  int _currentIndex = 0;
  int _score = 0;
  int? _selectedAnswerIndex;
  bool _isAnswered = false;
  bool _isSaving = false;

  bool _isLoading = true;
  List<dynamic> _questions = [];
  late String _realQuizId;

  String _displayTitle = "Quiz";
  int _quizPoints = 20;

  @override
  void initState() {
    super.initState();
    _displayTitle = widget.title; // Gán giá trị mặc định ban đầu
    _initData();
  }

  Future<void> _initData() async {
    // 1. Nếu có Data sẵn (Từ Săn điểm)
    if (widget.quizData != null) {
      if (mounted) {
        setState(() {
          _questions = widget.quizData['questions'] ?? [];
          _displayTitle = widget.quizData['title'] ?? widget.title;
          _quizPoints =
              widget.quizData['rewardPoint'] ??
              widget.quizData['max_points'] ??
              widget.quizData['bonusPoints'] ??
              20;

          var rawId = widget.quizData['_id'];
          _realQuizId = rawId is Map ? rawId['\$oid'] : rawId.toString();

          _isLoading = false;
        });
      }
    }
    // 2. Nếu chỉ có ID (Từ trang Home)
    else if (widget.quizId != null) {
      try {
        _realQuizId = widget.quizId!;

        final data = await EarnService.getQuizDetail(_realQuizId);

        if (mounted) {
          setState(() {
            _questions = data['questions'] ?? [];
            _displayTitle = data['title'] ?? widget.title;
            _quizPoints =
                data['rewardPoint'] ??
                data['max_points'] ??
                data['bonusPoints'] ??
                20;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) setState(() => _isLoading = false);
        print("Lỗi tải Quiz: $e");
      }
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _answerQuestion(int index, bool isCorrect) {
    if (_isAnswered) return;

    setState(() {
      _selectedAnswerIndex = index;
      _isAnswered = true;
      if (isCorrect) {
        _score++;
      }
    });

    Future.delayed(const Duration(seconds: 1), () {
      if (_currentIndex < _questions.length - 1) {
        setState(() {
          _currentIndex++;
          _selectedAnswerIndex = null;
          _isAnswered = false;
        });
      } else {
        _finishQuiz();
      }
    });
  }

  Future<void> _finishQuiz() async {
    setState(() => _isSaving = true);

    // Gọi API nộp bài
    final result = await EarnService.claimQuiz(_realQuizId);

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (result != null && result['success'] == true) {
      if (result['newPoints'] != null) {
        UserData.points = result['newPoints'];
      }
      UserData.quizzesDoneToday++;

      int pointsEarned = result['pointsEarned'] ?? _quizPoints;
      _showRewardDialog(pointsEarned);
    } else {
      String message = result?['message'] ?? "Lỗi kết nối!";
      if (message.contains("đã làm") || message.contains("đã nhận")) {
        _showAlreadyDoneDialog(message);
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
        _showFailDialog();
      }
    }
  }

  void _showAlreadyDoneDialog(String msg) {
    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text("Thông báo"),
        content: Text(msg),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text("OK"),
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
              const Icon(Icons.diamond, color: Colors.amber, size: 60),
              const SizedBox(height: 10),
              const Text(
                "Cộng điểm tích lũy",
                style: TextStyle(color: Colors.grey),
              ),
              Text(
                "$points",
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C2C54),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _showSuccessResultDialog();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                ),
                child: const Text(
                  "Tiếp tục",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSuccessResultDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 60),
              const SizedBox(height: 10),
              const Text(
                "Hoàn thành bài quiz",
                style: TextStyle(color: Colors.grey),
              ),
              Text(
                "$_score/${_questions.length}",
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C2C54),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Xuất sắc! Điểm đã được cộng vào ví.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.green),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                ),
                child: const Text("OK", style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFailDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cancel, color: Colors.red, size: 60),
              const SizedBox(height: 10),
              const Text(
                "Chưa hoàn thành",
                style: TextStyle(color: Colors.grey),
              ),
              Text(
                "$_score/${_questions.length}",
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C2C54),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Có lỗi xảy ra hoặc bạn đã nhận thưởng rồi.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.redAccent),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2C2C54),
                ),
                child: const Text(
                  "Đóng",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Đang tải..."),
          backgroundColor: const Color(0xFFB71C1C),
          foregroundColor: Colors.white,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Lỗi"),
          backgroundColor: const Color(0xFFB71C1C),
          foregroundColor: Colors.white,
        ),
        body: const Center(child: Text("Không có câu hỏi")),
      );
    }

    final question = _questions[_currentIndex];
    final List<dynamic> options = question['answers'] ?? [];

    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFFF5F5FA),
          appBar: AppBar(
            backgroundColor: const Color(0xFFB71C1C),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              _displayTitle,
              style: const TextStyle(color: Colors.white, fontSize: 16),
            ),
            centerTitle: true,
          ),
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(25),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2C2C54),
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        "Câu hỏi ${_currentIndex + 1} / ${_questions.length} • Thưởng $_quizPoints điểm", // Hiện điểm ở đây!
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 15),
                      Text(
                        question['content'] ?? "",
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                Expanded(
                  child: ListView.builder(
                    itemCount: options.length,
                    itemBuilder: (context, index) {
                      final option = options[index];
                      Color bgColor = Colors.white;
                      Color borderColor = Colors.transparent;
                      Color textColor = Colors.black87;
                      Widget? icon;

                      if (_isAnswered) {
                        if (option['is_correct'] == true) {
                          bgColor = Colors.green.shade50;
                          borderColor = Colors.green;
                          textColor = Colors.green;
                          icon = const Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 20,
                          );
                        } else if (index == _selectedAnswerIndex) {
                          bgColor = Colors.red.shade50;
                          borderColor = Colors.red;
                          textColor = Colors.red;
                          icon = const Icon(
                            Icons.cancel,
                            color: Colors.red,
                            size: 20,
                          );
                        }
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 15),
                        child: GestureDetector(
                          onTap: () => _answerQuestion(
                            index,
                            option['is_correct'] ?? false,
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              vertical: 15,
                              horizontal: 20,
                            ),
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: borderColor == Colors.transparent
                                    ? Colors.grey.shade300
                                    : borderColor,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withValues(alpha: 0.1),
                                  blurRadius: 5,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    option['content'] ?? "",
                                    style: TextStyle(
                                      color: textColor,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                if (icon != null) icon,
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
        if (_isSaving)
          Container(
            color: Colors.black.withValues(alpha: 0.5),
            child: const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 15),
                  Text(
                    "Đang cộng điểm...",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
