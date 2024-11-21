<template>
  <div class="my-3 row">
    <h3 class="mx-auto my-4">Giỏ hàng của tôi</h3>
    <table class="table">
      <thead class="table-light">
        <tr>
          <th>
            <input
              type="checkbox"
              class="w-100"
              v-model="selectAll"
              @change="toggleSelectAll"
            />
          </th>
          <th>Hình</th>
          <th>Tên Sách</th>
          <th>Số Lượng</th>
          <th>Giá</th>
          <th>Tổng Giá</th>
          <th>Thao Tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in booksInCart.books" :key="book.book_id">
          <td>
            <input
              type="checkbox"
              class="w-100"
              v-model="selectedBooks[book.book_id]"
              @change="handleCheckboxChange"
            />
          </td>
          <td style="width: 180px">
            <img
              class="img-fluid"
              :src="`http://localhost:3000/` + book.book_image"
              alt=""
            />
          </td>
          <td>
            <a class="text-decoration-none text-break text-dark">
              {{ book.book_name }}
              <div>
                <small>Còn lại ({{ book.book_number - book.book_borrowedNumber }})</small>
              </div>
            </a>
          </td>
          <td>
            <div class="input-group">
              <button
                class="border p-2"
                type="button"
                @click="decreaseQuantity(book, $event)"
              >
                -
              </button>
              <input
                :id="'inputQuantity_' + book.book_id"
                class="col-sm-3 col-md-3 border border-3 text-center"
                @change="updateQuantity(book, $event)"
                :value="book.quantity"
                min="1"
              />
              <button class="border p-2" type="button" @click="increaseQuantity(book)">
                +
              </button>
            </div>
          </td>
          <td>
            <span class="price text-danger fw-bold">
              {{ formattedPrice(book.book_price) }}
            </span>
          </td>
          <td>
            <span class="price text-danger fw-bold">
              {{ formattedPrice(book.total_price) }}
            </span>
          </td>
          <td>
            <a href="">
              <button
                @click="deleteBook(book.book_id, $event)"
                class="btn btn-danger"
                type="button"
              >
                Xóa
              </button>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="d-flex justify-content-end">
    <div class="mb-3">
      <a href="">
        <button class="btn btn-danger" @click="deleteAllBook($event)">Xóa tất cả</button>
      </a>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ApiService from "../../../service/ApiService";
import { formatPrice } from "@/utils/utils";
export default {
  setup(props, { emit }) {
    const booksInCart = ref([]);
    const selectedBooks = ref({});
    const selectAll = ref(false);
    const apiService = new ApiService();

    const getCarts = async () => {
      const token = Cookies.get("accessToken");
      if (token) {
        const response = await apiService.get(`cart/${token}`);
        if (response.status === 200) {
          booksInCart.value = response.data;
        }
      }
    };

    onMounted(() => {
      getCarts();
    });

    const increaseQuantity = (book) => {
      document.getElementById(`inputQuantity_${book.book_id}`).value++;
      updateTotalPrice(book);
      propsBooksGotoCart();
    };

    const decreaseQuantity = (book, event) => {
      const token = Cookies.get("accessToken");
      if (document.getElementById(`inputQuantity_${book.book_id}`).value > 1) {
        document.getElementById(`inputQuantity_${book.book_id}`).value--;
        updateTotalPrice(book);
        propsBooksGotoCart();
      } else {
        if (token) {
          deleteBook(book.book_id, event);
        }
      }
    };

    const updateTotalPrice = (book) => {
      book.total_price = book.quantity * book.book_price;
    };

    const updateQuantity = (book, event) => {
      const newQuantity = event.target.value;
      book.quantity = newQuantity;
      updateTotalPrice(book);
      propsBooksGotoCart();
    };

    const deleteBook = async (book_id, event) => {
      event.preventDefault();
      const token = Cookies.get("accessToken");
      if (token) {
        try {
          const isConfirmed = await Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy bỏ",
          });
          if (isConfirmed.isConfirmed) {
            const response = await apiService.delete(`cart/${book_id}`, token);
            if (response.status == 200) {
              getCarts();
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
      return;
    };

    const toggleSelectAll = () => {
      for (const book of booksInCart.value.books) {
        selectedBooks.value[book.book_id] = selectAll.value;
      }
      console.log(selectAll.value);
      console.log(selectedBooks.value);
      propsBooksGotoCart();
    };

    const propsBooksGotoCart = () => {
      const selectedBooksArray = [];
      const booksArray = booksInCart.value.books;
      if (Array.isArray(booksArray) && booksArray.length > 0) {
        for (const bookId in selectedBooks.value) {
          const isSelected = selectedBooks.value[bookId];
          if (isSelected) {
            const book = booksArray.find((book) => book.book_id === bookId);
            if (book) {
              const inputQuantityElement = document.getElementById(
                `inputQuantity_${book.book_id}`
              ).value;
              const inputQuantityValue = inputQuantityElement.trim();
              if (inputQuantityValue !== "") {
                const inputQuantity = parseInt(inputQuantityValue);
                if (!isNaN(inputQuantity) && inputQuantity >= 1) {
                  book.quantity = inputQuantity;
                  updateTotalPrice(book);

                  selectedBooksArray.push({
                    book_id: book.book_id,
                    quantity: book.quantity,
                    total_price: book.total_price,
                  });
                } else {
                  return;
                }
              } else {
                return;
              }
            }
          }
        }
      }
      emit("update:selected-books-updated", selectedBooksArray);
    };

    const deleteAllBook = async (event) => {
      event.preventDefault();
      const token = Cookies.get("accessToken");
      if (token) {
        try {
          const isConfirmed = await Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy bỏ",
          });

          if (isConfirmed.isConfirmed) {
            const response = await apiService.delete("cart/deleteAll", token);
            if (response.status == 200) {
              await Swal.fire({
                title: "Xóa thành công",
                text: "Xóa thành công tất cả sách khỏi giỏ hàng",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
              });
              getCarts();
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    const handleCheckboxChange = () => {
      console.log(selectedBooks.value);
      propsBooksGotoCart();
    };

    const formattedPrice = (price) => {
      return formatPrice(price);
    };

    return {
      booksInCart,
      selectedBooks,
      selectAll,
      updateQuantity,
      toggleSelectAll,
      getCarts,
      increaseQuantity,
      decreaseQuantity,
      deleteBook,
      propsBooksGotoCart,
      deleteAllBook,
      handleCheckboxChange,
      formattedPrice,
    };
  },
};
</script>
