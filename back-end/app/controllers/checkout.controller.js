const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const CheckoutService = require("../services/checkout.service");
const { ObjectId } = require("mongodb");


exports.create = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { selectedBooks } = req.body;
    if (!selectedBooks) {
        return next(
            new ApiError(400, "Vui lòng chọn sách để thanh toán")
        );
    }
    try {
        const checkoutService = new CheckoutService(MongoDB.client);
        let checkouted = await checkoutService.find({ user_id });
        if(checkouted){
            await checkoutService.deleteCheckOut(user_id);
        }
        document = await checkoutService.create({ selectedBooks, user_id });
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "Loi khi them checkout moi")
        );
    }
};

exports.findALL = async (req, res, next) => {
    let documents = [];

    try {
        const checkoutService = new CheckoutService(MongoDB.client);
        const { nxb_name } = req.query;
        if (nxb_name) {
            documents = await checkoutService.findByName(nxb_name);
        } else {
            documents = await checkoutService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving checkouts")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const checkoutService = new CheckoutService(MongoDB.client);
        const user_id = new ObjectId(req.user.user_id);
        const document = await checkoutService.find({ user_id });
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy checkout"));
        }
        return res.send(document[0]);
    } catch (error) {
        return next(
            new ApiError(500, "An Error Occurred while retrieving checkouts")
        );
    };
};

