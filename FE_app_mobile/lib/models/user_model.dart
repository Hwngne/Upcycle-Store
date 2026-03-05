class UserModel {
  final String id;
  final String name;
  final String email;
  final String avatar;
  final String role;
  final String phone;
  final String dob;
  final String gender;
  final int points;
  final String rank;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.avatar,
    required this.role,
    required this.phone,
    required this.dob,
    required this.gender,
    required this.points,
    required this.rank,
  });

  // Sau này sẽ thêm hàm: factory UserModel.fromJson(...) ở đây
}
