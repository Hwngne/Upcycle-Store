import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/forum_service.dart';
import '../../services/user_service.dart';

class CreatePostPage extends StatefulWidget {
  final String postType;

  const CreatePostPage({super.key, required this.postType});

  @override
  State<CreatePostPage> createState() => _CreatePostPageState();
}

class _CreatePostPageState extends State<CreatePostPage> {
  // --- CONTROLLERS ---
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  final TextEditingController _quantityController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  // --- DATA ---
  List<String> _topics = [];
  List<String> _categories = [];
  bool _isLoadingConfig = true;

  String? _selectedTopic;
  String? _selectedCategory;
  String _productType = "Miễn phí";

  // --- UPLOAD LOGIC ---
  bool _isUploading = false;
  XFile? _pickedImage;
  PlatformFile? _pickedFile;

  // --- INIT STATE: GỌI API LẤY DANH SÁCH ---
  @override
  void initState() {
    super.initState();
    _loadConfigData();
  }

  // Hàm tải dữ liệu Config từ Backend
  Future<void> _loadConfigData() async {
    final topicsData = await ForumService.fetchConfigList('topic');
    final productsData = await ForumService.fetchConfigList('product_type');

    if (mounted) {
      setState(() {
        _topics = topicsData;
        _categories = productsData;
        _isLoadingConfig = false;
      });
    }
  }

  // Hàm định dạng tiền tệ
  String formatCurrency(String value) {
    if (value.isEmpty) return "0";
    double? num = double.tryParse(value);
    if (num == null) return value;
    return num.toInt().toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }

  // --- 1. CHỌN ẢNH TỪ MÁY ---
  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    try {
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() {
          _pickedImage = image;
        });
      }
    } catch (e) {
      print("Lỗi chọn ảnh: $e");
    }
  }

  // --- 2. CHỌN FILE TÀI LIỆU ---
  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: [
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'zip',
          'rar',
          'txt',
        ],
      );

      if (result != null) {
        setState(() {
          _pickedFile = result.files.first;
        });
      }
    } catch (e) {
      print("Lỗi chọn file: $e");
    }
  }

  // --- VALIDATION ---
  bool _validateInputs() {
    if (_titleController.text.trim().isEmpty ||
        _contentController.text.trim().isEmpty) {
      _showError("Bạn chưa điền tiêu đề hoặc nội dung!");
      return false;
    }
    // Validate Topic (Kiến thức)
    if (widget.postType == "Kiến thức" && _selectedTopic == null) {
      _showError("Vui lòng chọn chủ đề!");
      return false;
    }
    // Validate Category (Sản phẩm)
    if (widget.postType == "Sản phẩm") {
      if (_selectedCategory == null) {
        _showError("Vui lòng chọn loại sản phẩm!");
        return false;
      }
      if (_quantityController.text.trim().isEmpty) {
        _showError("Vui lòng nhập số lượng!");
        return false;
      }
      if (_productType == "Có phí" &&
          (_priceController.text.isEmpty || _phoneController.text.isEmpty)) {
        _showError("Vui lòng nhập giá và số điện thoại!");
        return false;
      }
    }
    return true;
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  // --- 3. XEM TRƯỚC ---
  void _showPreviewDialog() {
    if (!_validateInputs()) return;

    ImageProvider previewImage;
    if (_pickedImage != null) {
      if (kIsWeb) {
        previewImage = NetworkImage(_pickedImage!.path);
      } else {
        previewImage = FileImage(File(_pickedImage!.path));
      }
    } else {
      previewImage = NetworkImage(
        widget.postType == "Kiến thức"
            ? "https://img.freepik.com/free-vector/garbage-sorting-concept-illustration_114360-5238.jpg"
            : "https://i.pinimg.com/736x/e8/35/66/e83566735e2632280d28589710080614.jpg",
      );
    }

    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(15),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // --- PHẦN HEADER CỦA BẢNG XEM TRƯỚC ---
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Xem trước bài đăng",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),

                Flexible(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 200,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            image: DecorationImage(
                              image: previewImage,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(15),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // --- HIỂN THỊ TAG SẢN PHẨM ---
                              if (widget.postType == "Sản phẩm") ...[
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: _productType == "Miễn phí"
                                            ? const Color.fromARGB(
                                                255,
                                                162,
                                                202,
                                                224,
                                              )
                                            : Colors.red,
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: Text(
                                        _productType == "Miễn phí"
                                            ? "MIỄN PHÍ"
                                            : "${formatCurrency(_priceController.text)} đ",
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.grey[200],
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: Text(
                                        _selectedCategory ?? "",
                                        style: TextStyle(
                                          color: Colors.grey[800],
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                              ],

                              if (widget.postType == "Kiến thức" &&
                                  _selectedTopic != null) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.blue[50],
                                    borderRadius: BorderRadius.circular(5),
                                    border: Border.all(
                                      color: Colors.blue.shade200,
                                    ),
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

                              // --- TIÊU ĐỀ VÀ NỘI DUNG ---
                              Text(
                                _titleController.text,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(_contentController.text),

                              if (_pickedFile != null) ...[
                                const SizedBox(height: 15),
                                Text(
                                  "Đính kèm: ${_pickedFile!.name}",
                                  style: const TextStyle(color: Colors.blue),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // --- PHẦN FOOTER --
                const Divider(height: 1),
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context); // Đóng Dialog
                        _handlePost(); // Gọi hàm Đăng
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1A237E),
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        "Đăng ngay",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- XỬ LÝ ĐĂNG BÀI (LOGIC CHUẨN) ---
  Future<void> _handlePost() async {
    if (_validateInputs()) {
      setState(() => _isUploading = true);

      double? priceVal;
      if (widget.postType == "Sản phẩm" && _productType == "Có phí") {
        String cleanPrice = _priceController.text.replaceAll('.', '');
        priceVal = double.tryParse(cleanPrice);
      }

      int? quantityVal;
      if (widget.postType == "Sản phẩm") {
        quantityVal = int.tryParse(_quantityController.text);
      }

      // Gọi Service
      bool success = await ForumService.createPost(
        widget.postType,
        _titleController.text,
        _contentController.text,
        _pickedImage,
        _pickedFile,

        topic: _selectedTopic,
        category: _selectedCategory,
        price: priceVal,
        quantity: quantityVal,
        phone: _phoneController.text,
      );

      setState(() => _isUploading = false);

      if (success) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Đã đăng bài thành công! +20 điểm"),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Đăng bài thất bại, vui lòng thử lại!"),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isKnowledge = widget.postType == "Kiến thức";
    Color tagColor = isKnowledge ? Colors.blue : const Color(0xFF009688);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Bài viết mới",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _isLoadingConfig
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                Container(
                  width: double.infinity,
                  height: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.white,
                        Color(0xFFFCE4EC),
                        Color(0xFFE3F2FD),
                      ],
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // User Info
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 28,
                              backgroundImage: NetworkImage(
                                UserData.avatar ??
                                    "https://via.placeholder.com/150",
                              ),
                            ),
                            const SizedBox(width: 15),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  UserData.name ?? "Người dùng",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: Color(0xFF1A237E),
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: tagColor,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    widget.postType,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 25),

                        // Form nhập liệu
                        if (isKnowledge)
                          _buildKnowledgeForm()
                        else
                          _buildProductForm(),

                        const SizedBox(height: 20),

                        // Hiển thị ảnh đã chọn
                        if (_pickedImage != null)
                          Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(15),
                                child: kIsWeb
                                    ? Image.network(
                                        _pickedImage!.path,
                                        height: 200,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      )
                                    : Image.file(
                                        File(_pickedImage!.path),
                                        height: 200,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      ),
                              ),
                              Positioned(
                                top: 10,
                                right: 10,
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _pickedImage = null),
                                  child: const CircleAvatar(
                                    backgroundColor: Colors.red,
                                    radius: 15,
                                    child: Icon(
                                      Icons.close,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),

                        // Hiển thị file đã chọn
                        if (_pickedFile != null)
                          Container(
                            margin: const EdgeInsets.only(top: 15),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.blue.shade200),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black12,
                                  blurRadius: 2,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.attach_file,
                                  color: Colors.blue,
                                  size: 24,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _pickedFile!.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue,
                                        ),
                                      ),
                                      Text(
                                        "${(_pickedFile!.size / 1024).toStringAsFixed(1)} KB",
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.close,
                                    color: Colors.red,
                                  ),
                                  onPressed: () =>
                                      setState(() => _pickedFile = null),
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 30),

                        // Buttons Chọn ảnh/file
                        Row(
                          children: [
                            _buildMediaButton(
                              Icons.image_outlined,
                              "Thư viện",
                              const Color(0xFFFFF0F0),
                              onTap: _pickImage,
                            ),
                            const SizedBox(width: 15),
                            _buildMediaButton(
                              Icons.attach_file,
                              "Đính kèm",
                              const Color(0xFFF0F4FF),
                              onTap: _pickFile,
                            ),
                          ],
                        ),
                        const SizedBox(height: 30),

                        // Buttons Submit
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: _showPreviewDialog,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey[300],
                                  foregroundColor: Colors.black87,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                child: const Text(
                                  "Xem trước",
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: _handlePost,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey[300],
                                  foregroundColor: const Color(0xFF1A237E),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                child: const Text(
                                  "Đăng",
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 50),
                      ],
                    ),
                  ),
                ),

                // Loading Overlay
                if (_isUploading)
                  Container(
                    color: Colors.black.withOpacity(0.5),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Colors.white),
                          SizedBox(height: 10),
                          Text(
                            "Đang tải dữ liệu lên...",
                            style: TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }

  // --- CÁC WIDGET CON ---
  Widget _buildMediaButton(
    IconData icon,
    String label,
    Color bgColor, {
    VoidCallback? onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(15),
            boxShadow: const [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 2,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: const Color(0xFF1A237E), size: 28),
              const SizedBox(height: 5),
              Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A237E),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKnowledgeForm() {
    return Column(
      children: [
        _buildDropdownField(
          hint: "Chủ đề bài viết",
          value: _selectedTopic,
          items: _topics,
          onChanged: (val) => setState(() => _selectedTopic = val),
        ),
        const SizedBox(height: 15),
        _buildInputField(
          controller: _titleController,
          hint: "Tiêu đề bài viết",
        ),
        const SizedBox(height: 15),
        _buildInputField(
          controller: _contentController,
          hint: "Bạn đang nghĩ gì?",
          maxLines: 8,
          height: 200,
        ),
      ],
    );
  }

  Widget _buildProductForm() {
    return Column(
      children: [
        Row(
          children: [
            const SizedBox(
              width: 100,
              child: Text(
                "Loại sản phẩm",
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              child: _buildDropdownField(
                hint: "Chọn loại...",
                value: _selectedCategory,
                items: _categories,
                onChanged: (val) => setState(() => _selectedCategory = val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 15),
        Row(
          children: [
            const SizedBox(
              width: 100,
              child: Text(
                "Tên sản phẩm",
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              child: _buildInputField(
                controller: _titleController,
                hint: "VD: Chậu hoa tái chế",
              ),
            ),
          ],
        ),
        const SizedBox(height: 15),
        Row(
          children: [
            const SizedBox(
              width: 100,
              child: Text(
                "Số lượng",
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              child: _buildInputField(
                controller: _quantityController,
                hint: "VD: 01",
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(4),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 15),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(
              width: 100,
              child: Padding(
                padding: EdgeInsets.only(top: 15),
                child: Text(
                  "Mô tả",
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
              ),
            ),
            Expanded(
              child: _buildInputField(
                controller: _contentController,
                hint: "Mô tả chi tiết...",
                maxLines: 4,
                height: 120,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            const SizedBox(
              width: 100,
              child: Text(
                "Hình thức",
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            _buildChoiceChip("Miễn phí", Colors.grey[200]!, Colors.black54),
            const SizedBox(width: 10),
            _buildChoiceChip("Có phí", Colors.red[50]!, Colors.red),
          ],
        ),
        if (_productType == "Có phí") ...[
          const SizedBox(height: 20),
          Row(
            children: [
              const SizedBox(
                width: 100,
                child: Text(
                  "Giá tiền",
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
              ),
              Expanded(
                child: _buildInputField(
                  controller: _priceController,
                  hint: "VD: 100000",
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(12),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              const SizedBox(
                width: 100,
                child: Text(
                  "SĐT liên lạc",
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
              ),
              Expanded(
                child: _buildInputField(
                  controller: _phoneController,
                  hint: "Nhập số điện thoại",
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildDropdownField({
    required String hint,
    required String? value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1)),
        ],
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          hint: Text(
            hint,
            style: TextStyle(color: Colors.grey[400], fontSize: 14),
          ),
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down),
          // Sửa lỗi: Nếu items rỗng, hoặc value không nằm trong items, tránh crash
          items: items.isEmpty
              ? []
              : items
                    .map(
                      (String item) => DropdownMenuItem<String>(
                        value: item,
                        child: Text(item, style: const TextStyle(fontSize: 14)),
                      ),
                    )
                    .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildChoiceChip(String label, Color bgColor, Color activeColor) {
    bool isSelected = _productType == label;
    Color finalBgColor = isSelected ? activeColor : bgColor;
    if (label == "Miễn phí" && isSelected) finalBgColor = Colors.green;
    return GestureDetector(
      onTap: () => setState(() => _productType = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: finalBgColor,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black54,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    double? height,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1)),
        ],
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        inputFormatters: inputFormatters,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 15,
            vertical: 15,
          ),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
