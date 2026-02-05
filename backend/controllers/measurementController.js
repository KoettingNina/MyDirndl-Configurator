import CustomerMeasurements from "../models/customerMeasurementsModel.js";

//ROUTE POST /api/customerMeasurements/create
// create a new measurement
const createMeasurement = async (req, res) => {
  try {
    const { customerAccount, height, bustSize, waistSize, hipSize, name } =
      req.body;

    const measurementExists = await CustomerMeasurements.exists({
      name,
      customerAccount,
    });
    if (measurementExists) {
      throw new Error("Measurement already exists");
    }

    const newMeasurement = await CustomerMeasurements.create({
      customerAccount,
      height,
      bustSize,
      waistSize,
      hipSize,
      name,
    });

    res.status(201).json({
      message: "Measurement created successfully",
      _id: newMeasurement._id,
      name: newMeasurement.name,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE POST /api/customerMeasurements/check
//check if the measurement with that name already exists for the customerId
const checkMeasurementExists = async (req, res) => {
  try {
    const { customerAccount, name } = req.body;

    const measurement = await CustomerMeasurements.findOne({
      name,
      customerAccount,
    });

    if (measurement) {
      return res.status(200).json({ exists: true, measurement });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ROUTE PUT /api/customerMeasurement/update/:id
// update an existing measurement
const updateMeasurement = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Measurement ID is required" });
    }

    const { customerAccount, height, bustSize, waistSize, hipSize, name } =
      req.body;

    const updatedMeasurements = {
      customerAccount: customerAccount,
      height: height,
      bustSize: bustSize,
      waistSize: waistSize,
      hipSize: hipSize,
      name: name,
    };

    const measurement = await CustomerMeasurements.findByIdAndUpdate(
      id,
      updatedMeasurements
    );
    if (!measurement) {
      throw new Error("Measurement not found");
    }

    res.status(200).json({
      message: "Measurement updated successfully",
      _id: measurement._id,
      name: measurement.name,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//ROUTE DELETE /api/customerMeasurement/delete/:id
// delete an existing measurement
const deleteMeasurement = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Measurement ID is required" });
    }

    const deleted = await CustomerMeasurements.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Measurement not found" });
    }

    res.status(200).json({
      message: "Measurement deleted successfully",
      _id: deleted._id,
      name: deleted.name,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all measurements for a customer
const getMeasurementByCustomer = async (req, res) => {
  try {
    // Find all measurements associated with the customer's account
    const measurements = await CustomerMeasurements.find({
      customerAccount: req.params.id,
    });

    res.status(200).json(measurements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMeasurement = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Measurement ID is required" });
    }

    const measurement = await CustomerMeasurements.findById(id);
    if (!measurement) {
      return res.status(404).json({ error: "Measurement not found" });
    }

    res.status(200).json({
      message: "Measurement fetched successfully",
      measurement,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  createMeasurement,
  deleteMeasurement,
  getMeasurement,
  getMeasurementByCustomer,
  updateMeasurement,
  checkMeasurementExists,
};
