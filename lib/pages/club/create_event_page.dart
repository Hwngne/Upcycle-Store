import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:intl/intl.dart';
import '../../services/user_service.dart';
import '../../services/event_service.dart';
import '../club/event_management.dart';
import 'package:table_calendar/table_calendar.dart';

class CreateEventPage extends StatefulWidget {
  const CreateEventPage({super.key});

  @override
  State<CreateEventPage> createState() => _CreateEventPageState();
}

class _CreateEventPageState extends State<CreateEventPage> {
  // --- BIẾN TRẠNG THÁI ---
  bool _isPaid = false;

  // --- CONTROLLERS ---
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _locationController = TextEditingController();
  final _priceController = TextEditingController();

  final _contactNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _formLinkController = TextEditingController();
  final _attachmentLinkController = TextEditingController();

  // --- BIẾN FILE/ẢNH ---
  XFile? _selectedImage;
  PlatformFile? _selectedFile;

  // --- BIẾN NGÀY GIỜ ---
  String _selectedDate = "";
  DateTime? _eventDateObj;
  String _startTime = "";
  String _endTime = "";
  List<String> _topicList = [];
  String? _selectedTopic;
  bool _isLoadingTopics = true;

  // --- BIẾN QUẢNG BÁ  ---
  bool _promoHome = false;
  bool _promoForum = false;
  DateTime _promoStart = DateTime.now();
  DateTime _promoEnd = DateTime.now().add(const Duration(days: 3));

  @override
  void initState() {
    super.initState();
    _contactNameController.text = UserData.name ?? "";
    _emailController.text = UserData.email ?? "";
    _phoneController.text = UserData.phone ?? "";
    _fetchTopics();
  }

  DateTime _toMidnight(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  // --- VALIDATE  ---
  bool _isValidUrl(String url) {
    return Uri.tryParse(url)?.hasAbsolutePath ?? false;
  }

  bool _validateInputs() {
    // 1. Kiểm tra các trường bắt buộc
    if (_nameController.text.isEmpty ||
        _selectedTopic == null ||
        _descController.text.isEmpty ||
        _locationController.text.isEmpty ||
        _selectedDate.isEmpty ||
        _startTime.isEmpty ||
        _endTime.isEmpty ||
        _contactNameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _phoneController.text.isEmpty ||
        _formLinkController.text.isEmpty) {
      _showSnackBar("Vui lòng điền đầy đủ thông tin bắt buộc (*)", Colors.red);
      return false;
    }

    // 2. Kiểm tra giá vé
    if (_isPaid && _priceController.text.isEmpty) {
      _showSnackBar("Vui lòng nhập giá vé", Colors.red);
      return false;
    }

    // 3. Kiểm tra độ dài số điện thoại
    String phone = _phoneController.text.trim();
    if (phone.length < 10 || phone.length > 11) {
      _showSnackBar(
        "Số điện thoại không hợp lệ (phải từ 10-11 số)",
        Colors.orange,
      );
      return false;
    }

    // 4. Kiểm tra định dạng URL Form
    if (!_isValidUrl(_formLinkController.text.trim())) {
      _showSnackBar(
        "Link form không hợp lệ (Phải có http:// hoặc https://)",
        Colors.orange,
      );
      return false;
    }

    return true;
  }

  void _showSnackBar(String msg, Color color) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(msg), backgroundColor: color));
  }

  Future<void> _fetchTopics() async {
    List<String> topics = await EventService.getTopics();
    if (mounted) {
      setState(() {
        _topicList = topics;
        _isLoadingTopics = false;
      });
    }
  }

  // --- XỬ LÝ GỬI FORM ---
  Future<void> _handleCreateEvent() async {
    if (!_validateInputs()) return;

    // Hiện loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (c) => const Center(
        child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
      ),
    );

    // Chuẩn bị dữ liệu quảng bá
    List<String> promoLocs = [];
    if (_promoHome) promoLocs.add("home");
    if (_promoForum) promoLocs.add("forum");
    DateFormat fmt = DateFormat('dd/MM/yyyy');

    final Map<String, dynamic> eventData = {
      'name': _nameController.text.trim(),
      'topic': _selectedTopic,
      'description': _descController.text.trim(),
      'isPaid': _isPaid,
      'price': _isPaid ? _priceController.text : "Miễn phí",
      'location': _locationController.text.trim(),
      'date': _selectedDate,
      'startTime': _startTime,
      'endTime': _endTime,
      'contactName': _contactNameController.text.trim(),
      'contactEmail': _emailController.text.trim(),
      'contactPhone': _phoneController.text.trim(),
      'formLink': _formLinkController.text.trim(),
      'bannerUrl': _selectedImage?.path ?? "",
      'attachmentUrl': _attachmentLinkController.text.trim(),
      'promotionLocations': promoLocs,
      'promotionStartDate': promoLocs.isNotEmpty ? fmt.format(_promoStart) : "",
      'promotionEndDate': promoLocs.isNotEmpty ? fmt.format(_promoEnd) : "",
    };

    bool success = await EventService.createEvent(
      eventData, // Dữ liệu text
      _selectedImage, // Biến XFile ảnh banner
      _selectedFile, // Biến PlatformFile đính kèm
    );

    if (!mounted) return;
    Navigator.pop(context);

    if (success) {
      _showSuccessDialog();
    } else {
      _showSnackBar("Gửi yêu cầu thất bại. Vui lòng thử lại!", Colors.red);
    }
  }

  // --- CÁC HÀM PICKER ---
  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _selectedImage = image);
  }

  void _handleAttachment() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Đính kèm tài liệu",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.link, color: Colors.blue),
                title: const Text("Dán đường dẫn (Link Drive, PDF...)"),
                onTap: () {
                  Navigator.pop(context);
                  _showLinkDialog();
                },
              ),
              ListTile(
                leading: const Icon(Icons.upload_file, color: Colors.orange),
                title: const Text("Chọn file từ thiết bị"),
                onTap: () {
                  Navigator.pop(context);
                  _pickFile();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLinkDialog() {
    final linkCtrl = TextEditingController(
      text: _attachmentLinkController.text,
    );
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Nhập đường dẫn tài liệu"),
        content: TextField(
          controller: linkCtrl,
          decoration: const InputDecoration(
            hintText: "https://docs.google.com/...",
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Hủy"),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _attachmentLinkController.text = linkCtrl.text;
                _selectedFile = null;
              });
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB71C1C),
            ),
            child: const Text("Lưu", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      setState(() {
        _selectedFile = result.files.first;
        _attachmentLinkController.clear();
      });
    }
  }

  Future<void> _pickDate() async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
      builder: (context, child) => Theme(
        data: ThemeData.light().copyWith(
          primaryColor: const Color(0xFFB71C1C),
          colorScheme: const ColorScheme.light(primary: Color(0xFFB71C1C)),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _eventDateObj = picked;
        _selectedDate = "${picked.day}/${picked.month}/${picked.year}";

        _promoStart = picked;
        _promoEnd = picked.add(const Duration(days: 3));
      });
    }
  }

  void _openPromoCalendar() {
    showDialog(
      context: context,
      builder: (context) => PromotionCalendarDialog(
        initialDate: _promoStart,
        onRangeSelected: (start, end) {
          setState(() {
            _promoStart = start;
            _promoEnd = end;
          });
        },
      ),
    );
  }

  Future<void> _pickTime(bool isStart) async {
    TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() {
        String formattedTime =
            "${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}";
        isStart ? _startTime = formattedTime : _endTime = formattedTime;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final double headerHeight = size.height * 0.25;

    DateTime startZero = _toMidnight(_promoStart);
    DateTime endZero = _toMidnight(_promoEnd);

    int promoDuration = endZero.difference(startZero).inDays;
    int extraDays = promoDuration > 3 ? promoDuration - 3 : 0;
    int penaltyPoints = extraDays * 100;

    DateFormat fmt = DateFormat('dd/MM/yyyy');

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text(
          "Sự kiện mới",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        elevation: 0,
      ),
      body: Stack(
        children: [
          // HEADER ĐỎ
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFFB71C1C), Color(0xFFD32F2F)],
                ),
              ),
            ),
          ),

          // FORM
          SafeArea(
            bottom: false,
            child: Container(
              width: double.infinity,
              height: double.infinity,
              margin: const EdgeInsets.only(top: 60),
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 20),
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      stops: [0.0, 0.54, 1.0],
                      colors: [
                        Color(0xFFF3DDDD),
                        Color(0xFFFFFFFF),
                        Color(0xFFE5EFFF),
                      ],
                    ),
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(30),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Header Info CLB
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 25,
                              backgroundImage: NetworkImage(
                                UserData.avatar ?? "https://i.pravatar.cc/300",
                              ),
                            ),
                            const SizedBox(width: 15),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  UserData.name ?? "Câu Lạc Bộ",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.green),
                                  ),
                                  child: const Text(
                                    "CLB | Sự kiện",
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Nội dung Form
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionTitle("Thông tin sự kiện"),
                            const SizedBox(height: 15),
                            _buildLabel("Tên sự kiện", isRequired: true),
                            _buildTextField(
                              hint: "TÁC HẠI CỦA RÁC THẢI...",
                              controller: _nameController,
                            ),

                            _buildDropdownField(
                              label: "Chủ đề",
                              isRequired: true,
                              value: _selectedTopic,
                              items: _topicList,
                              onChanged: (newValue) =>
                                  setState(() => _selectedTopic = newValue),
                            ),

                            _buildLabel("Mô tả sự kiện", isRequired: true),
                            _buildTextField(
                              hint: "Nhập mô tả chi tiết...",
                              controller: _descController,
                              maxLines: 4,
                            ),

                            _buildLabel("Hình thức", isRequired: true),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(30),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: Row(
                                children: [
                                  _buildToggleButton("Miễn phí", !_isPaid),
                                  _buildToggleButton("Có phí", _isPaid),
                                ],
                              ),
                            ),

                            if (_isPaid) ...[
                              const SizedBox(height: 15),
                              _buildLabel("Tiền vé", isRequired: true),
                              _buildTextField(
                                hint: "100.000",
                                controller: _priceController,
                                keyboardType: TextInputType.number,
                                suffixText: "VND",
                              ),
                            ],

                            const SizedBox(height: 15),
                            _buildLabel("Địa điểm", isRequired: true),
                            _buildTextField(
                              hint: "CS3.F.09.10",
                              controller: _locationController,
                            ),

                            _buildLabel("Ngày tổ chức", isRequired: true),
                            GestureDetector(
                              onTap: _pickDate,
                              child: _buildTextField(
                                hint: _selectedDate.isEmpty
                                    ? "dd/mm/yyyy"
                                    : _selectedDate,
                                enabled: false,
                                icon: Icons.calendar_today,
                              ),
                            ),

                            _buildLabel("Thời gian", isRequired: true),
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => _pickTime(true),
                                    child: _buildTextField(
                                      hint: _startTime.isEmpty
                                          ? "--:--"
                                          : _startTime,
                                      enabled: false,
                                      icon: Icons.access_time_filled,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                const Text(
                                  "-",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                    color: Colors.grey,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => _pickTime(false),
                                    child: _buildTextField(
                                      hint: _endTime.isEmpty
                                          ? "--:--"
                                          : _endTime,
                                      enabled: false,
                                      icon: Icons.access_time_filled,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 25),
                            Container(
                              padding: const EdgeInsets.all(15),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.1),
                                    blurRadius: 5,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Icon(
                                        Icons.campaign,
                                        color: Color(0xFFB71C1C),
                                      ),
                                      SizedBox(width: 8),
                                      Text(
                                        "Đăng ký quảng bá",
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: Color(0xFF2C2C54),
                                        ),
                                      ),
                                      Spacer(),
                                      Text(
                                        "(Tùy chọn)",
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20),
                                  CheckboxListTile(
                                    title: const Text(
                                      "Quảng bá trên trang chủ",
                                      style: TextStyle(fontSize: 14),
                                    ),
                                    value: _promoHome,
                                    activeColor: const Color(0xFFB71C1C),
                                    contentPadding: EdgeInsets.zero,
                                    controlAffinity:
                                        ListTileControlAffinity.leading,
                                    onChanged: (v) =>
                                        setState(() => _promoHome = v!),
                                  ),
                                  CheckboxListTile(
                                    title: const Text(
                                      "Quảng bá trên diễn đàn",
                                      style: TextStyle(fontSize: 14),
                                    ),
                                    value: _promoForum,
                                    activeColor: const Color(0xFFB71C1C),
                                    contentPadding: EdgeInsets.zero,
                                    controlAffinity:
                                        ListTileControlAffinity.leading,
                                    onChanged: (v) =>
                                        setState(() => _promoForum = v!),
                                  ),

                                  if (_promoHome || _promoForum) ...[
                                    const SizedBox(height: 10),
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF5F5FA),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Column(
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: GestureDetector(
                                                  onTap: _openPromoCalendar,
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      const Text(
                                                        "Bắt đầu",
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: Colors.grey,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Row(
                                                        children: [
                                                          const Icon(
                                                            Icons
                                                                .calendar_today,
                                                            size: 14,
                                                            color: Colors.grey,
                                                          ),
                                                          const SizedBox(
                                                            width: 5,
                                                          ),
                                                          Text(
                                                            fmt.format(
                                                              _promoStart,
                                                            ),
                                                            style:
                                                                const TextStyle(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontSize: 13,
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                width: 1,
                                                height: 30,
                                                color: Colors.grey[300],
                                              ),
                                              const SizedBox(width: 15),
                                              Expanded(
                                                child: GestureDetector(
                                                  onTap: _openPromoCalendar,
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      const Text(
                                                        "Kết thúc",
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: Colors.grey,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Row(
                                                        children: [
                                                          const Icon(
                                                            Icons.event,
                                                            size: 14,
                                                            color: Colors.grey,
                                                          ),
                                                          const SizedBox(
                                                            width: 5,
                                                          ),
                                                          Text(
                                                            fmt.format(
                                                              _promoEnd,
                                                            ),
                                                            style:
                                                                const TextStyle(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontSize: 13,
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          if (extraDays > 0)
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.info_outline,
                                                  color: Colors.red,
                                                  size: 16,
                                                ),
                                                const SizedBox(width: 5),
                                                Expanded(
                                                  child: Text(
                                                    "Gia hạn thêm $extraDays ngày: -$penaltyPoints điểm",
                                                    style: const TextStyle(
                                                      color: Colors.red,
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            )
                                          else
                                            Row(
                                              children: const [
                                                Icon(
                                                  Icons.check_circle_outline,
                                                  color: Colors.green,
                                                  size: 16,
                                                ),
                                                SizedBox(width: 5),
                                                Text(
                                                  "3 ngày tiêu chuẩn: Miễn phí điểm",
                                                  style: TextStyle(
                                                    color: Colors.green,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ],
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),

                            const SizedBox(height: 30),
                            const Divider(),
                            const SizedBox(height: 10),

                            _buildSectionTitle("Thông tin liên hệ"),
                            const SizedBox(height: 15),
                            _buildLabel("Người phụ trách", isRequired: true),
                            _buildTextField(
                              hint: "Họ tên",
                              controller: _contactNameController,
                            ),
                            _buildLabel("Email", isRequired: true),
                            _buildTextField(
                              hint: "email@domain.com",
                              controller: _emailController,
                            ),
                            _buildLabel("Sđt", isRequired: true),
                            _buildTextField(
                              hint: "Số điện thoại",
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                            ),
                            _buildLabel("Form đăng ký", isRequired: true),
                            _buildTextField(
                              hint: "https://example.com/form",
                              controller: _formLinkController,
                            ),

                            const SizedBox(height: 30),
                            const Divider(),
                            const SizedBox(height: 10),

                            _buildSectionTitle("Thông tin bổ sung"),
                            const SizedBox(height: 15),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildUploadButton(
                                    icon: Icons.image_outlined,
                                    label: _selectedImage != null
                                        ? "Đã chọn ảnh"
                                        : "Thư viện",
                                    onTap: _pickImage,
                                    isSelected: _selectedImage != null,
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: _buildUploadButton(
                                    icon: Icons.attach_file,
                                    label: _selectedFile != null
                                        ? _selectedFile!.name
                                        : (_attachmentLinkController
                                                  .text
                                                  .isNotEmpty
                                              ? "Đã đính kèm Link"
                                              : "Đính kèm"),
                                    onTap: _handleAttachment,
                                    isSelected:
                                        _selectedFile != null ||
                                        _attachmentLinkController
                                            .text
                                            .isNotEmpty,
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 15,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.yellow[50],
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.orange.withOpacity(0.3),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.monetization_on,
                                    color: Colors.orange,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    "Hoàn tất: ",
                                    style: TextStyle(
                                      color: Colors.black87,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const Text(
                                    "+100 điểm ",
                                    style: TextStyle(
                                      color: Colors.orange,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (extraDays > 0)
                                    Text(
                                      "(-$penaltyPoints phí gia hạn)",
                                      style: const TextStyle(
                                        color: Colors.red,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),

                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () {
                                      if (_validateInputs())
                                        _showPreviewDialog();
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      foregroundColor: Colors.black,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 15,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      elevation: 2,
                                      side: const BorderSide(
                                        color: Color(0xFFB71C1C),
                                        width: 1,
                                      ),
                                    ),
                                    child: const Text(
                                      "Xem trước",
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFFB71C1C),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: _handleCreateEvent,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFFFF0F0),
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 15,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      elevation: 2,
                                      side: const BorderSide(
                                        color: Color(0xFFB71C1C),
                                        width: 1,
                                      ),
                                    ),
                                    child: const Text(
                                      "Gửi yêu cầu",
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFFB71C1C),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 50),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- DIALOG XEM TRƯỚC ---
  void _showPreviewDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --- HEADER ---
              Padding(
                padding: const EdgeInsets.all(15),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundImage: NetworkImage(UserData.avatar ?? ""),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          UserData.name ?? "CLB",
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            "CLB",
                            style: TextStyle(fontSize: 10, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      _selectedDate,
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              // --- NỘI DUNG ---
              Flexible(
                child: SingleChildScrollView(
                  child: Container(
                    color: const Color(0xFFFFF5F5),
                    padding: const EdgeInsets.all(15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_selectedTopic != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.blue[50],
                              borderRadius: BorderRadius.circular(5),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Text(
                              "Chủ đề: $_selectedTopic",
                              style: TextStyle(
                                color: Colors.blue[800],
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                        ],

                        Text(
                          _nameController.text.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2C2C54),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Ảnh xem trước
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: _selectedImage != null
                              ? (kIsWeb
                                    ? Image.network(
                                        _selectedImage!.path,
                                        height: 150,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      )
                                    : Image.file(
                                        File(_selectedImage!.path),
                                        height: 150,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      ))
                              : Image.network(
                                  "https://picsum.photos/400/200",
                                  height: 150,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _descController.text,
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 15),
                        const Text(
                          "Thông tin sự kiện",
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        _buildPreviewInfo(
                          "Thời gian:",
                          "$_startTime - $_endTime, ngày $_selectedDate",
                        ),
                        _buildPreviewInfo(
                          "Địa điểm:",
                          _locationController.text,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text(
                              "Giá vé: ",
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              _isPaid
                                  ? "${_priceController.text} VND/người"
                                  : "Miễn phí",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          "Đăng ký:",
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          _formLinkController.text,
                          style: const TextStyle(
                            color: Colors.blue,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // --- FOOTER NÚT BẤM ---
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.all(15),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          "Hủy",
                          style: TextStyle(
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _handleCreateEvent();
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          backgroundColor: const Color(0xFFB71C1C),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          "Gửi yêu cầu",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- UI WIDGETS ---
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Color(0xFF2C2C54),
      ),
    );
  }

  Widget _buildLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 10),
      child: RichText(
        text: TextSpan(
          text: label,
          style: const TextStyle(
            color: Color(0xFF2C2C54),
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
          children: [
            if (isRequired)
              const TextSpan(
                text: " *",
                style: TextStyle(color: Colors.red),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String hint,
    TextEditingController? controller,
    int maxLines = 1,
    bool enabled = true,
    IconData? icon,
    Color? iconColor,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    String? suffixText,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        enabled: enabled,
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 15,
            vertical: 15,
          ),
          suffixIcon: icon != null
              ? Icon(icon, color: iconColor ?? Colors.grey)
              : null,
          suffixText: suffixText,
          suffixStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
      ),
    );
  }

  Widget _buildDropdownField({
    required String label,
    required bool isRequired,
    required String? value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 100,
                  child: RichText(
                    text: TextSpan(
                      text: label,
                      style: const TextStyle(
                        color: Color(0xFF2C2C54),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                      children: [
                        if (isRequired)
                          const TextSpan(
                            text: " *",
                            style: TextStyle(color: Colors.red),
                          ),
                      ],
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 20,
                  color: Colors.grey[300],
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                ),
                Expanded(
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: value,
                      hint: Text(
                        _isLoadingTopics ? "Đang tải..." : "Chọn chủ đề",
                        style: TextStyle(color: Colors.grey[400], fontSize: 13),
                      ),
                      isExpanded: true,
                      icon: const Icon(
                        Icons.arrow_drop_down,
                        color: Colors.grey,
                      ),
                      dropdownColor: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      items: items.map((String item) {
                        return DropdownMenuItem<String>(
                          value: item,
                          child: Text(
                            item,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.black87,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: onChanged,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton(String text, bool isSelected) {
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _isPaid = (text == "Có phí")),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE3F2FD) : Colors.transparent,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Center(
            child: Text(
              text,
              style: TextStyle(
                color: isSelected ? const Color(0xFF1565C0) : Colors.grey,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUploadButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isSelected = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 80,
        decoration: BoxDecoration(
          color: isSelected ? Colors.red[50] : const Color(0xFFFFF0F0),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: const Color(0xFFFFCDD2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFFB71C1C)),
            const SizedBox(height: 5),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Color(0xFF2C2C54),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                decoration: const BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 20),
              const Text(
                "Gửi yêu cầu thành công",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C2C54),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Vui lòng đợi phản hồi từ admin để sự kiện được duyệt và đăng tải.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 25),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB71C1C),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        "Về trang chủ",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pop(context);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const EventManagementPage(),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB71C1C),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        "Quản lý Sự kiện",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPreviewInfo(String label, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "• $label ",
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          Expanded(
            child: Text(
              content,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

// --- DIALOG CHỌN NGÀY QUẢNG BÁ ---
class PromotionCalendarDialog extends StatefulWidget {
  final DateTime initialDate;
  final Function(DateTime start, DateTime end) onRangeSelected;

  const PromotionCalendarDialog({
    super.key,
    required this.initialDate,
    required this.onRangeSelected,
  });

  @override
  State<PromotionCalendarDialog> createState() =>
      _PromotionCalendarDialogState();
}

class _PromotionCalendarDialogState extends State<PromotionCalendarDialog> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _rangeStart;
  DateTime? _rangeEnd;
  Map<String, int> _slotCounts = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _focusedDay = widget.initialDate;
    _rangeStart = widget.initialDate;
    _rangeEnd = widget.initialDate.add(const Duration(days: 3));
    _fetchAvailability();
  }

  void _fetchAvailability() async {
    setState(() => _isLoading = true);
    final data = await EventService.getPromotionAvailability(
      _focusedDay.month,
      _focusedDay.year,
    );
    if (mounted) {
      setState(() {
        _slotCounts = data;
        _isLoading = false;
      });
    }
  }

  bool _isDayFull(DateTime day) {
    String key = "${day.day}/${day.month}/${day.year}";
    int count = _slotCounts[key] ?? 0;
    return count >= 3;
  }

  bool _isRangeValid(DateTime? start, DateTime? end) {
    if (start == null) return true;
    DateTime check = start;
    DateTime finalEnd = end ?? start;

    while (!check.isAfter(finalEnd)) {
      if (_isDayFull(check)) return false;
      check = check.add(const Duration(days: 1));
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Chọn ngày quảng bá",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 5),
            const Text(
              "Mỗi ngày tối đa 3 slot",
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 10),

            _isLoading
                ? const SizedBox(
                    height: 300,
                    child: Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFB71C1C),
                      ),
                    ),
                  )
                : TableCalendar(
                    firstDay: DateTime.now(),
                    lastDay: DateTime.utc(2030, 12, 31),
                    focusedDay: _focusedDay,
                    rangeStartDay: _rangeStart,
                    rangeEndDay: _rangeEnd,
                    rangeSelectionMode: RangeSelectionMode.toggledOn,

                    headerStyle: const HeaderStyle(
                      formatButtonVisible: false,
                      titleCentered: true,
                      titleTextStyle: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPageChanged: (focusedDay) {
                      _focusedDay = focusedDay;
                      _fetchAvailability();
                    },

                    onRangeSelected: (start, end, focusedDay) {
                      setState(() {
                        _focusedDay = focusedDay;
                        if (start != null && _isDayFull(start)) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Ngày này đã kín lịch!"),
                            ),
                          );
                          return;
                        }
                        _rangeStart = start;
                        _rangeEnd = end;
                      });
                    },

                    calendarBuilders: CalendarBuilders(
                      defaultBuilder: (context, day, focusedDay) {
                        String key = "${day.day}/${day.month}/${day.year}";
                        int used = _slotCounts[key] ?? 0;
                        int available = 3 - used;

                        if (used >= 3) {
                          return Container(
                            margin: const EdgeInsets.all(6),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              "${day.day}",
                              style: TextStyle(color: Colors.red[300]),
                            ),
                          );
                        }
                        return Container(
                          margin: const EdgeInsets.all(4),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "${day.day}",
                                style: const TextStyle(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: List.generate(3, (index) {
                                  return Container(
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 1,
                                    ),
                                    width: 5,
                                    height: 5,
                                    decoration: BoxDecoration(
                                      color: index < available
                                          ? Colors.green
                                          : Colors.grey[300],
                                      shape: BoxShape.circle,
                                    ),
                                  );
                                }),
                              ),
                            ],
                          ),
                        );
                      },

                      // 2. Ngày bị disable
                      disabledBuilder: (context, day, focusedDay) {
                        return Center(
                          child: Text(
                            "${day.day}",
                            style: const TextStyle(color: Colors.red),
                          ),
                        );
                      },

                      // 3. Ngày đang được chọn (Range Start/End/Middle)
                      rangeStartBuilder: (context, day, focusedDay) =>
                          _buildSelectedRange(day, true),
                      rangeEndBuilder: (context, day, focusedDay) =>
                          _buildSelectedRange(day, true),
                      rangeHighlightBuilder: (context, day, isWithinRange) {
                        if (isWithinRange) {
                          return Container(
                            margin: const EdgeInsetsDirectional.only(
                              top: 6,
                              bottom: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.blue.withOpacity(0.2),
                              shape: BoxShape.rectangle,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          );
                        }
                        return null;
                      },
                    ),

                    enabledDayPredicate: (day) => !_isDayFull(day),
                  ),

            const SizedBox(height: 20),

            // Chú thích
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLegend(Colors.green, "Còn chỗ"),
                const SizedBox(width: 15),
                _buildLegend(Colors.grey[300]!, "Đã đặt"),
                const SizedBox(width: 15),
                _buildLegend(Colors.red.withOpacity(0.5), "Đã đầy"),
              ],
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                if (_rangeStart == null) return;

                if (!_isRangeValid(_rangeStart, _rangeEnd)) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        "Khoảng chọn có ngày đã kín lịch. Vui lòng chọn lại!",
                      ),
                      backgroundColor: Colors.red,
                    ),
                  );
                  return;
                }

                widget.onRangeSelected(_rangeStart!, _rangeEnd ?? _rangeStart!);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFB71C1C),
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                "Xác nhận",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Widget helper để vẽ ngày đang chọn
  Widget _buildSelectedRange(DateTime day, bool isEnd) {
    return Container(
      margin: const EdgeInsets.all(6),
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: Colors.blue,
        shape: BoxShape.circle,
      ),
      child: Text(
        "${day.day}",
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // Widget chú thích
  Widget _buildLegend(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
