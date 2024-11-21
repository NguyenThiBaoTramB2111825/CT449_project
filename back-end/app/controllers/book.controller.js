const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service");
const PublisherService = require("../services/publisher.service.js");
const multer = require('../utils/multerConfig.js');
const fs = require('fs').promises;
const { ObjectId } = require("mongodb");
const BorrowService = require("../services/borrow.service.js");

exports.create = async (req, res, next) => {
  try {
    multer.any()(req, res, async function (err) {
      if (err) {
        return next(new ApiError(500, "Error uploading image"));
      }

      if (!req.body?.book_name == null || !req.body?.book_description == null || !req.body?.book_image == null || !req.body?.book_price == null ||
        !req.body?.book_number == null || !req.body?.publisher_year == null || !req.body?.publisher_id == null) {
        return next(new ApiError(400, "Field can not be empty"));
      }

      try {
        const bookService = new BookService(MongoDB.client);
        const imagePathArray = req.files.map(file => file.path);
        const imagePathString = imagePathArray.join(', ');
        req.body.imagePath = imagePathString;
        const document = await bookService.create(req.body);
        return res.send(document);
      } catch (error) {
        return next(new ApiError(500, "An Error Occurred while creating the book"));
      }
    });
  } catch (error) {
    return next(new ApiError(500, "An Error Occurred while processing the request"));
  }
};

exports.findALL = async (req, res, next) => {
  let books = [];
  try {
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);
    const { book_name } = req.query;
    if (book_name) {
      books = await bookService.findByName(book_name);
    } else {
      books = await bookService.find({});
    }
    const booksWithPublisherInfo = await Promise.all(
      books.map(async (book) => {
        const publisherInfo = await publisherService.getPublisherInfoById(book.publisher_id);
        return {
          ...book,
          publisherInfo: publisherInfo || {},
        };
      })
    );
    return res.send(booksWithPublisherInfo);
  } catch (error) {
    return next(
      new ApiError(500, "An Error Occurred while retrieving books")
    );
  }
};

exports.search = async (req, res, next) => {
  let books = [];
  try {
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);
    const { book_name } = req.query;
    if (book_name) {
      books = await bookService.findByName(book_name);
    }
    const booksWithPublisherInfo = await Promise.all(
      books.map(async (book) => {
        const publisherInfo = await publisherService.getPublisherInfoById(book.publisher_id);
        return {
          ...book,
          publisherInfo: publisherInfo || {},
        };
      })
    );
    return res.send(booksWithPublisherInfo);
  } catch (error) {
    return next(
      new ApiError(500, "An Error Occurred while retrieving books")
    );
  }
};

exports.checkNumberBook = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const bookscheckNumber = req.body;
    let errorOccurred = false;

    for (const book of bookscheckNumber) {
      // admin gửi qua ( gửi qua có borrowedNumber )
      if (book.book_borrowedNumber >= 0) {
        const availableBooks = parseInt(book.book_number) - parseInt(book.book_borrowedNumber);
        if (parseInt(book.quantity) > availableBooks) {
          res.status(402).send({ message: "Số lượng sách không hợp lệ" });
          errorOccurred = true;
          break;
        }
      }
      else { // cart gửi qua
        const bookInfo = await bookService.findById(book.book_id);
        const availableBooks = parseInt(bookInfo.book_number) - parseInt(bookInfo.book_borrowedNumber);
        if (parseInt(book.quantity) > availableBooks) {
          res.status(402).send({ message: "Số lượng sách không hợp lệ" });
          errorOccurred = true;
          break;
        }
      }
    }

    if (!errorOccurred) {
      res.status(200).send();
    }

  } catch (error) {
    return next(
      new ApiError(500, "Error while checking books for publisher")
    );
  }
};

exports.productsHome = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);
    const randomBooks = await bookService.findRandomBooks(4);
    const booksWithPublisherInfo = await Promise.all(
      randomBooks.map(async (book) => {
        const publisherInfo = await publisherService.getPublisherInfoById(book.publisher_id);
        return {
          ...book,
          publisherInfo: publisherInfo || {},
        };
      })
    );
    return res.json(booksWithPublisherInfo);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu sách ngẫu nhiên"));
  }
};

exports.filterBooksWithPublisher = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.publisher_id)) {
      return res.status(400).json({ error: 'Invalid publisher ID' });
    }
    const bookService = new BookService(MongoDB.client);
    const publisherService = new PublisherService(MongoDB.client);

    const books = await bookService.find({ publisher_id: new ObjectId(req.params.publisher_id) });

    const booksWithPublisherInfo = await Promise.all(
      books.map(async (book) => {
        const publisherInfo = await publisherService.getPublisherInfoById(book.publisher_id);
        return {
          ...book,
          publisherInfo: publisherInfo || {},
        };
      })
    );

    return res.json(booksWithPublisherInfo);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu sách theo nhà xuất bản"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    const publisherService = new PublisherService(MongoDB.client);
    if (!document) {
      return next(new ApiError(404, "Contact not found"));
    }
    const publisherInfo = await publisherService.findById(document.publisher_id);
    const book = {
      ...document,
      publisherInfo: publisherInfo
    }

    return res.json(book);
  } catch (error) {
    return next(
      new ApiError(500, "An Error Occurred while retrieving books")
    );
  };
};

exports.update = async (req, res, next) => {
  try {
    multer.any()(req, res, async function (err) {
      if (err) {
        console.log(err);
        return next(new ApiError(500, "Error uploading image"));
      }

      if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
      }

      try {
        const bookService = new BookService(MongoDB.client);
        const currentBook = await bookService.findById(req.params.id);
        if (req.files && req.files.length > 0 && currentBook.book_image) {
          const oldbook_image = currentBook.book_image;
          await fs.unlink(oldbook_image);
        }

        if (req.files && req.files.length > 0) {
          const imagePathArray = req.files.map(file => file.path);
          const imagePathString = imagePathArray.join(" ")
          req.body.imagePath = imagePathString;
        }

        req.body.publisher_id = req.body.publisher_id || currentBook.publisher_id;
        const document = await bookService.update(req.params.id, req.body);
        if (!document) {
          return next(new ApiError(404, "book not found"));
        }
        return res.send({ messgae: "Book was updated successfully" });
      } catch (error) {
        return next(
          new ApiError(500, `Error updating book with id=${req.params.id}`)
        );
      }
    });
  } catch (error) {
    return next(new ApiError(500, "An Error Occurred while processing the request"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    await fs.unlink(document.book_image);
    if (!document) {
      return next(new ApiError(404, "book not found"));
    }
    return res.send({ messgae: "book was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete book with id=${req.params.id}`)
    );
  }
};

exports.deleteALL = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();
    return res.send({
      message: `${deletedCount} books were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An Error Occurred while removing all books")
    );
  }
};

