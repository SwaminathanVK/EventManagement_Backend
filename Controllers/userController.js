// Controllers/userController.js
import User from "../Models/user.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "profile fetched successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

//Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();
    res
      .status(200)
      .json({
        message: "User profile updated succcessfully",
        user: { name: user.name, email: user.email },
      });
  } catch (err) {
    res.status(400).send({ message: "Error updating user profile" });
  }
};
