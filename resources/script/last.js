function get_normal_collection(count, callback) {
  http_get("{ collections(first: " + count + ") { edges {  node { id image {src} } } }} ", callback);
}

function show_login_page() {
  let currentURL = window.location.href;
  window.location.href = "/customer/login.html?redirect=" + encodeURIComponent(currentURL);
}

function set_home_page_products() {
  if (document.getElementById('home_collection')) {
    get_products_by_collection_id("156766470249", function(result) {
      let data = result.data.collections.edges[0].node.products.edges;
      let output = [];
      for (let i = 0; i < data.length; i++) {
        let pid = atob(data[i].node.id).split("/")[4];
        output.push('<div style="float:left;margin-right:20px"><a href="/products/product.html?pid=' + pid + '"><img src="' + data[i].node.images.edges[0].node.src + '" width="260px" height="260px"></a></div>');
      }
      document.getElementById('home_collection').innerHTML = output.join("");
    })
  }
}

if ($("#page-header").length > 0) {
    $("#page-header").load("/page_header.html", function() {
        if (document.getElementById("login")) {
            let token = get_value_from_cookie("customer_token");
            if (token) {
                document.getElementById("login").innerHTML = "ログアウト";
                document.getElementById("login_link").href = "javascript:customer_logout();";
                document.getElementById("order_list").style.display = "inline";
            }
        }
        let url = new URL(window.location.href);
        if(url.pathname == "/index.html"){
            get_categories(function(result) {
                let categories = result.site.categoryTree;
                let td_array = [];
                for (var i = 0; i < 8; i++) {
                    let index = i;
                    if(categories[i] == undefined){
                        index = i - categories.length;
                    }
                    get_category_info(categories[index].entityId, function(category_info){
                        let src_img = category_info.node.defaultImage;
                        if(!src_img){
                            src_img = "/images/c" + (td_array.length+1) + ".png";
                        }else{
                          src_img = src_img.url;
                        }
                        td_array.push("<td><a href=\"/collections/collection_one.html?cid=" + categories[index].entityId + "\"><img src=\"" + src_img + "\" title=\""+ categories[index].name +"\" width=\"285px\" height=\"100px\"></a></td>");
                        if(td_array.length == 8){
                            let str_html = "<table><tr>" + td_array[0] + td_array[1] + td_array[2] + td_array[3] + "</tr><tr>" + td_array[4] + td_array[5] + td_array[6] + td_array[7] + "</tr></table>";
                            if (document.getElementById("normal_collections")) {
                                document.getElementById("normal_collections").innerHTML = str_html;
                            }
                        }
                    });
                }
            });
        }
    });
}

if ($("#page-footer").length > 0) {
  $("#page-footer").load("/page_footer.html");
}
