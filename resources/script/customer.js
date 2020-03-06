
if (document.getElementById("reset_password")) {
  $("#reset_password").on("click", function(event) {
    let email = document.getElementById("user_email").value;
    let old_password = document.getElementById("old_user_password").value;
    let new_password = document.getElementById("new_user_password").value;
    let new_password_2 = document.getElementById("new_user_password_2").value;
	if(new_password != new_password_2){
		alert("パスワードは一致しない");
	}else{
		reset_customer_password(email, old_password, new_password, function(result){
			window.location.href = "/index.html";
		});
	}
  });
}

if (document.getElementById("create_customer")) {
  $("#create_customer").on("click", function(event) {
    let email = document.getElementById("user_email").value;
    let password = document.getElementById("user_password").value;
    let first_name = document.getElementById("first_name").value;
    let last_name = document.getElementById("last_name").value;
    create_customer_user(email, password, first_name, last_name, function(result) {
      if (result.data.length > 0) {
        window.location.href = "/customer/login.html";
      }
    });
  });
}

if (document.getElementById("customer_login")) {
  let redirect = decodeURIComponent(get_url_parameter(window.location.href, "redirect"));
  if(redirect != ""){
    document.getElementById("login_form").action = redirect;
  }
  let mail = get_url_parameter(redirect, "email");
  document.getElementById("user_email").value = mail;
  if (mail) {
    document.getElementById("user_email").readOnly = true;
  }
  $("#customer_login").on("click", function(event) {
    let email = document.getElementById("user_email").value;
    let password = document.getElementById("user_password").value;
    customer_login(email, password, function(id, result) {
      if (result.data == false) {
        alert(result.data);
      } else {
		  let cart_id = get_value_from_cookie("cart_id");
		  if(cart_id){
			  set_customerid_to_cart(cart_id);
		  }
        window.location.href = document.getElementById("login_form").action;
      }
    });
  });
}
