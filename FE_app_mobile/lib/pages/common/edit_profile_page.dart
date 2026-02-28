import 'dart:io';
import 'package:flutter/foundation.dart'; // Để dùng kIsWeb
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../components/app_background.dart';
import '../../services/auth_service.dart';
import '../../services/user_service.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  late TextEditingController _nameController;
  late TextEditingController _dobController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  String _selectedGender = "Nữ";

  // Biến trạng thái
  bool _isChanged = false;
  bool _isLoading = false;

  // --- LOGIC AVATAR ---
  XFile? _pickedFile;
  String _currentAvatarUrl = UserData.avatar ?? "https://i.pravatar.cc/300";

  // Danh sách Avatar có sẵn 
  final List<String> _presetAvatars = [
    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png", // Nam
    "https://cdn-icons-png.flaticon.com/512/4140/4140047.png", // Nữ
    "https://cdn-icons-png.flaticon.com/512/4140/4140037.png", // Mèo
    "https://cdn-icons-png.flaticon.com/512/4140/4140051.png", // Gấu
    "https://cdn-icons-png.flaticon.com/512/924/924915.png", // Robot
    "https://cdn-icons-png.flaticon.com/512/4333/4333609.png", // Cáo
  ];

  // Giá trị gốc để so sánh thay đổi
  late String _initialDob;
  late String _initialPhone;
  late String _initialGender;

  @override
  void initState() {
    super.initState();
    // 1. Load dữ liệu tạm từ RAM (UserData)
    _nameController = TextEditingController(
      text: UserData.name?.toUpperCase() ?? "",
    );
    _dobController = TextEditingController(text: UserData.dateOfBirth ?? "");
    _emailController = TextEditingController(text: UserData.email ?? "");
    _phoneController = TextEditingController(text: UserData.phone ?? "");

    _selectedGender = (UserData.gender == "Nam" || UserData.gender == "Nữ")
        ? UserData.gender!
        : "Nữ";

    _initialDob = _dobController.text;
    _initialPhone = _phoneController.text;
    _initialGender = _selectedGender;

    // Lắng nghe thay đổi
    _dobController.addListener(_checkForChanges);
    _phoneController.addListener(_checkForChanges);

    // 2. Gọi API lấy dữ liệu mới nhất (Sync Background)
    _fetchLatestData();
  }

  // Hàm mới: Lấy dữ liệu mới nhất từ Server
  Future<void> _fetchLatestData() async {
    try {
      final data = await UserService.getUserProfile(); 
      if (mounted) {
        setState(() {
          _dobController.text = data['dateOfBirth'] ?? "";
          _phoneController.text = data['phone'] ?? "";

          String gender = data['gender'] ?? "Nữ";
          if (gender == "M" || gender == "Male") gender = "Nam";
          if (gender == "F" || gender == "Female") gender = "Nữ";
          _selectedGender = gender;

          _currentAvatarUrl = data['avatar'] ?? "https://i.pravatar.cc/300";

          // Cập nhật lại giá trị gốc
          _initialDob = _dobController.text;
          _initialPhone = _phoneController.text;
          _initialGender = _selectedGender;

          _checkForChanges();
        });

        // Cập nhật UserData tĩnh
        UserData.dateOfBirth = data['dateOfBirth'];
        UserData.phone = data['phone'];
        UserData.gender = _selectedGender;
        UserData.avatar = _currentAvatarUrl;
      }
    } catch (e) {
      print(" Không thể đồng bộ dữ liệu mới nhất: $e");
    }
  }

  void _checkForChanges() {
    bool hasChanged =
        _dobController.text != _initialDob ||
        _phoneController.text != _initialPhone ||
        _selectedGender != _initialGender ||
        _pickedFile != null ||
        _currentAvatarUrl != (UserData.avatar ?? "https://i.pravatar.cc/300");

    if (hasChanged != _isChanged) {
      setState(() => _isChanged = hasChanged);
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    try {
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() {
          _pickedFile = image;
          _checkForChanges();
        });
      }
    } catch (e) {
      print("Lỗi chọn ảnh: $e");
    }
  }

  void _selectPresetAvatar(String url) {
    setState(() {
      _currentAvatarUrl = url;
      _pickedFile = null;
      _checkForChanges();
    });
    Navigator.pop(context);
  }

  Future<void> _handleSave() async {
    String inputPhone = _phoneController.text.trim();
    final phoneRegex = RegExp(r'^0\d{9}$');

    if (!phoneRegex.hasMatch(inputPhone)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("SĐT không hợp lệ! (Phải 10 số & bắt đầu bằng 0)"),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    setState(() => _isLoading = true);

    String avatarToSend = _currentAvatarUrl;
    if (_pickedFile != null) {
      avatarToSend = _pickedFile!.path;
    }

    bool success = await AuthService.updateProfile(
      gender: _selectedGender,
      phone: _phoneController.text,
      dateOfBirth: _dobController.text,
      avatar: avatarToSend,
    );

    if (mounted) {
      setState(() => _isLoading = false);

      if (success) {
        _initialDob = _dobController.text;
        _initialPhone = _phoneController.text;
        _initialGender = _selectedGender;
        _isChanged = false;

        // Cập nhật lại UserData tĩnh ngay lập tức để đồng bộ
        UserData.phone = _phoneController.text;
        UserData.dateOfBirth = _dobController.text;
        UserData.gender = _selectedGender;
        UserData.avatar = avatarToSend;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Cập nhật hồ sơ thành công!"),
            backgroundColor: Colors.green,
          ),
        );

        Future.delayed(const Duration(milliseconds: 500), () {
          Navigator.pop(context, true);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Lỗi kết nối, vui lòng thử lại!"),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showAvatarOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Đổi ảnh đại diện",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildOptionBtn(Icons.photo_library, "Thư viện", () {
                  Navigator.pop(context);
                  _pickImage();
                }),
                _buildOptionBtn(Icons.face, "Có sẵn", () {
                  Navigator.pop(context);
                  _showPresetSheet();
                }),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _showPresetSheet() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        height: 300,
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              "Chọn Avatar có sẵn",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: _presetAvatars.length,
                itemBuilder: (context, index) => GestureDetector(
                  onTap: () => _selectPresetAvatar(_presetAvatars[index]),
                  child: CircleAvatar(
                    backgroundImage: NetworkImage(_presetAvatars[index]),
                    backgroundColor: Colors.grey[200],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionBtn(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.blue.shade50,
            child: Icon(icon, size: 30, color: Colors.blue),
          ),
          const SizedBox(height: 8),
          Text(label),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dobController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider avatarImage;
    if (_pickedFile != null) {
      if (kIsWeb) {
        avatarImage = NetworkImage(_pickedFile!.path);
      } else {
        avatarImage = FileImage(File(_pickedFile!.path));
      }
    } else {
      if (_currentAvatarUrl.startsWith('http')) {
        avatarImage = NetworkImage(_currentAvatarUrl);
      } else {
        avatarImage = FileImage(File(_currentAvatarUrl));
      }
    }

    return Stack(
      children: [
        Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            backgroundColor: const Color(0xFFB71C1C),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios,
                color: Colors.white,
                size: 20,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              "Chỉnh sửa hồ sơ",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            centerTitle: true,
          ),
          body: AppBackground(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Stack(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: CircleAvatar(
                            radius: 50,
                            backgroundImage: avatarImage,
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: _showAvatarOptions,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: Colors.blue,
                                shape: BoxShape.circle,
                                border: Border.fromBorderSide(
                                  BorderSide(color: Colors.white, width: 2),
                                ),
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                color: Colors.white,
                                size: 18,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    "Thông tin cá nhân",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 20),
                  _buildLabel("Tên *"),
                  _buildTextField(_nameController, isReadOnly: true),
                  const SizedBox(height: 15),
                  _buildLabel("Ngày sinh"),
                  GestureDetector(
                    onTap: () async {
                      DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime(2005),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null) {
                        _dobController.text =
                            "${picked.day}/${picked.month}/${picked.year}";
                      }
                    },
                    child: AbsorbPointer(
                      child: _buildTextField(
                        _dobController,
                        icon: Icons.calendar_today,
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildLabel("Giới tính"),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: const [
                        BoxShadow(color: Colors.black12, blurRadius: 2),
                      ],
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedGender,
                        isExpanded: true,
                        icon: const Icon(
                          Icons.keyboard_arrow_down,
                          color: Colors.red,
                        ),
                        items: ["Nam", "Nữ", "Khác"]
                            .map(
                              (val) => DropdownMenuItem(
                                value: val,
                                child: Text(val),
                              ),
                            )
                            .toList(),
                        onChanged: (val) {
                          setState(() {
                            _selectedGender = val!;
                            _checkForChanges();
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    "Thông tin liên hệ",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 20),
                  _buildLabel("Email *"),
                  _buildTextField(_emailController, isReadOnly: true),
                  const SizedBox(height: 15),
                  _buildLabel("Sđt *"),
                  _buildTextField(
                    _phoneController,
                    inputType: TextInputType.phone,
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: (_isChanged && !_isLoading)
                          ? _handleSave
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isChanged
                            ? const Color(0xFFB71C1C)
                            : Colors.grey[300],
                        foregroundColor: _isChanged
                            ? Colors.white
                            : Colors.grey[600],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              "XÁC NHẬN",
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
        if (_isLoading)
          Container(
            color: Colors.black.withOpacity(0.3),
            child: const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
          ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    if (text.contains("*")) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: RichText(
          text: TextSpan(
            text: text.replaceAll("*", ""),
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.w500,
            ),
            children: const [
              TextSpan(
                text: " *",
                style: TextStyle(color: Colors.red),
              ),
            ],
          ),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.black87,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller, {
    bool isReadOnly = false,
    IconData? icon,
    TextInputType inputType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isReadOnly ? Colors.grey[300] : Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: isReadOnly
            ? []
            : const [BoxShadow(color: Colors.black12, blurRadius: 2)],
      ),
      child: TextField(
        controller: controller,
        readOnly: isReadOnly,
        keyboardType: inputType,
        style: TextStyle(color: isReadOnly ? Colors.grey[600] : Colors.black),
        decoration: InputDecoration(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 15,
            vertical: 15,
          ),
          border: InputBorder.none,
          suffixIcon: icon != null
              ? Icon(icon, color: Colors.grey, size: 20)
              : null,
        ),
      ),
    );
  }
}
