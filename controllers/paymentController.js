const Payment = require("../models/Payment");
const Student = require("../models/Student");

const OwnerSettings = require(
  "../models/OwnerSettings"
);


// ======================================================
// GET STUDENT PAYMENT HISTORY
// ======================================================

exports.getStudentPayments = async (
  req,
  res
) => {

  try {

    // ==================================================
    // GET STUDENT ID FROM JWT
    // ==================================================

    const studentId = req.student.id;

    // ==================================================
    // FIND PAYMENTS OF LOGGED-IN STUDENT
    // ==================================================

    const payments = await Payment.find({

      student: studentId

    })

    .select(
      "paymentId amount month recordedAt"
    )

    .sort({
      recordedAt: -1
    });

    // ==================================================
    // GET OWNER QR URL
    // ==================================================

    const settings =
      await OwnerSettings.findOne();

    // ==================================================
    // FIND STUDENT
    // ======================================================

    const student = await Student.findById(studentId)
      .select(
        "fullName bookingStatus approvedBy room"
      )
      .populate({
        path: "room",
        select: "roomNumber seaterType monthlyFee"
      });

    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(200).json({

      payments,

      qrUrl:
        settings?.paymentQrUrl || "",

      student: student
        ? {
            id: student._id,
            fullName: student.fullName,
            bookingStatus: student.bookingStatus,
            approvedBy: student.approvedBy,
            room: student.room
              ? {
                  number: student.room.roomNumber,
                  seaterType: student.room.seaterType,
                  fee: student.room.monthlyFee
                }
              : null
          }
        : null
    });

  } catch (error) {

    res.status(500).json({

      error: error.message
    });
  }
};