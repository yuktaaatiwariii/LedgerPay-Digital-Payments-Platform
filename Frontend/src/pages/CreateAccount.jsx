

// const handleCreateAccount = async () => {
//   try {
//     const token = localStorage.getItem("token");

//     const res = await axios.post(
//       "http://localhost:5000/api/accounts",
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log(res.data);
//     alert("Account created successfully!");
//   } catch (err) {
//     console.error(err);
//     alert(
//       err.response?.data?.message || "Failed to create account."
//     );
//   }
// };

