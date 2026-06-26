import Addresses from "../models/address.model.js";

// Save delivery address
export const saveDeliveryAddress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }
    const { fullName, deliveryAddress, pin, phoneNumber, email } = req.body;
    console.log(req.body);

    if (!fullName || !deliveryAddress || !pin || !phoneNumber || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ message: "Invalid PIN code." });
    }
    if (!/^\d{10}$/.test(String(phoneNumber))) {
      return res.status(400).json({ message: "Invalid phone number." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const newAddress = new Addresses({
      userId,
      fullName,
      deliveryAddress,
      pin,
      phoneNumber,
      email,
    });

    const savedAddress = await newAddress.save();

    res
      .status(201)
      .json({ message: "Address saved successfully.", address: savedAddress });
  } catch (error) {
    console.error("Address save error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to save address." });
  }
};

// Get all addresses (customer)
export const getAllAddress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const addresses = await Addresses.find({ userId: userId });

    if (!addresses.length) {
      return res.status(404).json({ message: "No address found." });
    }
    console.log(addresses);
    res.status(200).json({
      message: "Address fetched succfully.",
      addresses,
    });
  } catch (error) {
    console.error("Get all address error:", error);
    res.status(500).json({ message: "Failed to fetch addresses." });
  }
};

// Update delivery address
export const updateDeliveryAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.addressId;
    console.log(addressId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const { fullName, deliveryAddress, pin, phoneNumber, email } = req.body;

    const address = await Addresses.findOneAndUpdate(
      {
        _id: addressId,
        userId: userId,
      },
      {
        fullName,
        deliveryAddress,
        pin,
        phoneNumber,
        email,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    res.status(200).json({
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Address update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update address." });
  }
};

// Delete delivery address (customer)
export const deleteDeliveryAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressId = req.params.addressId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const address = await Addresses.findOneAndDelete({
      _id: addressId,
      userId: userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    res.status(200).json({
      message: "Address deleted successfully.",
      address,
    });
  } catch (error) {
    console.error("Address delete error:", error);
    res.status(500).json({ message: "Failed to delete address." });
  }
};
