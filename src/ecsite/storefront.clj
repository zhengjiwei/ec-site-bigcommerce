(ns ecsite.storefront
    (:gen-class)
    (:require
      [clj-http.client :as client]
      [slingshot.slingshot :refer [try+]]
      [clojure.data.json :as json]
      [clojure.string :as str]
      [cheshire.core :as cjson]
      [ecsite.common.other :as other]
      [ecsite.common.url :as url_util]
      )

  (:import
    (java.util Date)
    (com.auth0.jwt.algorithms Algorithm)
    (com.auth0.jwt JWT JWTVerifier)
    (com.auth0.jwt.exceptions JWTCreationException JWTVerificationException)
    (com.auth0.jwt.interfaces Verification DecodedJWT))
    )

(def store_setting (ref {}))

;
;(defn id-to-base64 [^String type ^String id]
;  (String. (.encode (java.util.Base64/getEncoder) (.getBytes (str "gid://shopify/" type "/" id))))
;  )
;
(defn base64-to-id [^String base64]
  (prn base64)
  (String. (.decode (java.util.Base64/getDecoder) (.getBytes base64)))
  )

(defn verify-token [token]
  (-> token (str/split #"\.") second base64-to-id json/read-str (get "eat") (* 1000) (> (.getTime (Date.))))
  )

(defn parse-token-info [token index]
  (try
    (json/read-str (String. (.decode (java.util.Base64/getUrlDecoder) (get (str/split token #"\.") index)) "UTF-8"))
    (catch Exception e
      ))
  )

(defn create-jwt [json-data]
  (try
    (let [expire (Date. (+ (.getTime (Date.)) (* 30 24 3600 1000)))
          alg (Algorithm/HMAC256 (get @store_setting "client_secret"))]
      (-> (JWT/create)
          (.withIssuer "bigcommerce")
          (.withExpiresAt expire)
          (.withClaim (-> json-data first key str) (-> json-data first val))
          (.withClaim (-> json-data second key str) (-> json-data second val))
          (.sign alg)
          )
      )
    (catch JWTCreationException e
      (prn "### e" e)
      e
      ))
  )

(defn verify-jwt [jwt]
  (try
    (let [alg (Algorithm/HMAC256 (get @store_setting "client_secret"))
          verifier (-> alg JWT/require (.withIssuer (into-array ["bigcommerce"])) (.build))
          ^DecodedJWT decodeJwt (.verify verifier jwt)
          token (.getToken decodeJwt)
          ]
      (parse-token-info token 1)
      )
    (catch JWTVerificationException e
      (prn "### e" e)
      e
      ))
  )

(defn common-post [^String url json-data]
  (prn "### url=" url json-data)
    (client/post (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/api/storefront/" url)
                 {:content-type "application/json"
                  :cookie-policy :standard
                  :accept "application/json"
                  :form-params json-data}
                 )
  )

(defn front-query [^String url xsrf-token session-token id]
  (prn "## front-query" url xsrf-token session-token id)
  (client/get (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/api/storefront/" url)
               {:cookies {"SHOP_SESSION_TOKEN" {:value session-token} "fornax_anonymousId" {:value id}}
                :content-type "application/json"
                :cookie-policy :standard
                :accept "application/json"}
               )
  )

(defn front-post [^String url xsrf-token session-token id json-data]
  (prn "## front-post" url xsrf-token session-token id json-data)
  (client/post (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/api/storefront/" url)
              {:cookies {"SHOP_SESSION_TOKEN" {:value session-token} "fornax_anonymousId" {:value id}}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"
               :form-params json-data
               }
              )
  )

(defn front-delete [^String url xsrf-token session-token id]
  (prn "## front-delete" url xsrf-token session-token id)
  (client/delete (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/api/storefront/" url)
                 {:cookies {"SHOP_SESSION_TOKEN" {:value session-token} "fornax_anonymousId" {:value id}}
                  :content-type "application/json"
                  :cookie-policy :standard
                  :accept "application/json"}
                 )
  )

(defn front-put [^String url xsrf-token session-token id json-data]
  (prn "### front-put:" url xsrf-token session-token id json-data)
  (client/put (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/api/storefront/" url)
              {:cookies {"SHOP_SESSION_TOKEN" {:value session-token} "fornax_anonymousId" {:value id}}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"
               :form-params json-data
               }
              )
  )


(defn server-query [^String url]
  (prn "### server-query" url)
  (client/get (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") url)
              {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"}
              )
  )

(defn server-post [^String url json-data]
  (prn "### server-post" url json-data)
  (let [input {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"}
        input (if (empty? json-data) input (assoc input :form-params json-data))]
    (client/post (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") url) input)
    )
  )

(defn server-put [^String url json-data]
  (prn "### server-put" url json-data)
  (client/put (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") url)
              {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"
               :form-params json-data})
  )

(defn server-delete [^String url json-data]
  (prn "### server-delete" url json-data)
  (let [input {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/json"}
        input (if (empty? json-data) input (assoc input :form-params json-data))]
    (client/delete (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") url) input)
    )
  )

(defn graphql-query [token json]
  (prn "### token=" token json)
  (client/post (str "https://" (get @store_setting "shop_name") ".mybigcommerce.com/graphql")
               {:headers {:Authorization (str "Bearer " token)}
                :content-type "application/json"
                :cookie-policy :standard
                :accept "application/json"
                :form-params json
                }
               )
  )

(defn get-api-token []
  (-> (client/post
        (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") "/v3/storefront/api-token")
        {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
         :content-type "application/json"
         :cookie-policy :standard
         :accept "application/json"
         :form-params  {"channel_id" 1, "expires_at" (int (/ (+ (.getTime (Date.)) (* 1000 3600)) 1000)), "allowed_cors_origins" ["*"]}
         }
        ) :body (json/read-str) (get "data") (get "token"))
  )

(defn transform-cookies [json]
  (reduce-kv
    (fn [m k v]
      (let [cookie (select-keys v [:path :expires :value :max-age])]
        (assoc m k (if (:expires v)
                     (assoc cookie :expires (str (other/get-gmt-string (:expires v) "EEE, dd-MMM-yyyy HH:mm:ss") " GMT"))
                     cookie)
                 )))
    {} json)
  )

(defn add-billing-address [url token session id json-data email]
  (let [new-json {"firstName" (get json-data "first_name")
                  "lastName" (get json-data "last_name")
                  "stateOrProvince" (get json-data "state_or_province")
                  "stateOrProvinceCode" (get json-data "state_or_province_code")
                  "postalCode" (get json-data "postal_code")
                  "countryCode" (get json-data "country_code")
                  }
        new-json (merge new-json (select-keys json-data ["city" "address1" "address2" "company" "email" "phone"]))
        new-json (if (nil? (get new-json "email")) (assoc new-json "email" email) new-json)
        ]
    (front-post url token session id new-json)
    )
  )

(defn add-shipping-address [url token session id json-data]
  (let [;get line items from cart
        result (front-query "carts?include=lineItems.digitalItems.options%2ClineItems.physicalItems.options" token session id)
        items (-> result :body json/read-str first (get "lineItems"))
        p_items (get items "physicalItems")
        d_items (get items "digitalItems")
        g_items (get items "giftCertificates")
        append_items #(update-in %1 ["line_items"]
                                 (fn [m items]
                                   (reduce (fn [m2 item]
                                             (merge m2 {"item_id" (get item "id") "quantity" (get item "quantity")})
                                             ) (if (empty? m) [] m) items))
                                 %2)
        json-data {"shipping_address" json-data}
        json-data (if (empty? p_items) json-data (append_items json-data p_items))
        json-data (if (empty? d_items) json-data (append_items json-data d_items))
        json-data (if (empty? g_items) json-data (append_items json-data g_items))]
    (client/post (str "https://api.bigcommerce.com/stores/" (get @store_setting "shop_cache") url)
                 {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token")}
                  :content-type "application/json"
                  :cookie-policy :standard
                  :accept "application/json"
                  :form-params [json-data]}
                 )
    )
  )

(defn add-shipping-option [result]
  (let [data (-> result :body json/read-str (get "data"))
        cart_id (-> data (get "cart") (get "id"))
        consignment_id (-> data (get "consignments") first (get "id"))
        shipping_id (-> data (get "consignments") first (get "available_shipping_options") first (get "id"))
        ]
    (server-put (str "/v3/checkouts/" cart_id "/consignments/" consignment_id "?include=consignments.available_shipping_options")
                 {"shipping_option_id" shipping_id})
    )
  )

(defn cart-to-order [^String url json-data request]
  (prn "#### cart-to-order")
  (let [cookies (:cookies request)
        customer_token (-> cookies (get "customer_token") :value)
        customer_info (when (not-empty customer_token) (-> customer_token verify-jwt))
        customer_id (when (not-empty customer_info) (get customer_info "customer_id"))
        customer_email (when (not-empty customer_info) (get customer_info "email"))
        json-data (if (not-empty customer_id) (assoc json-data "customerId" (str customer_id)) json-data)
        token (:value (get cookies "XSRF-TOKEN"))
        session (:value (get cookies "SHOP_SESSION_TOKEN"))
        id (:value (get cookies "fornax_anonymousId"))
        cart_id (:value (get cookies "cart_id"))
        ]
    (add-billing-address (str "checkouts/" cart_id "/billing-address") token session id json-data customer_email)
    (add-shipping-option (add-shipping-address url token session id json-data))
    ;transform checkout to order
    (server-post (str "/v3/checkouts/" cart_id "/orders") nil)
    )
  )

(defn get-customer-orders [request]
  (prn "### get-customer-orders")
  (let [cookies (:cookies request)
        customer_token (-> cookies (get "customer_token") :value)
        email (when (not-empty customer_token) (-> customer_token verify-jwt (get "email")))
        url (str (-> request :params :url) "&email=" (url_util/uri-encode email))
        ]
    (prn "###url=" url)
    (server-query url)
    )
  )

;(defn create-customer [request]
;  (let [url (-> request :params :url)
;        json-data (-> request :params :data json/read-str)
;        password (get json-data "password")
;        result (server-post url json-data)
;        id (-> result :body json/read-str (get "data") (get "id"))]
;    (prn "### " result)
;    (server-put (str "v2/customers/") (assoc (dissoc json-data "password")
;                                        "_authentication" {"password" password,"password_confirmation" password}))
;    )
;  )

(defn customer-login [^String url json-data]
  (prn "### customer-login" url json-data)
  (let [result (server-post url (select-keys json-data ["password"]))
        result (-> result :body json/read-str (get "success"))]
    (if (= true result)
      (let [id (re-find #"/v2/customers/\d+" url)
            id (str/replace id #"/v2/customers/" "")
            cookie (create-jwt {"customer_id" id "email" (get json-data "email")})
            expire (Date. (+ (.getTime (Date.)) (* 30 24 3600 1000)))
            ]
        {:status 200, :body (cjson/generate-string {:data true}) :cookies {"customer_token" {:expires expire :path "/" :value cookie}}}
        )
      {:status 200, :body (cjson/generate-string {:data false})}
      )
    )
  )

(defn add-customer-address [request]
  (prn "### add-customer-address")
  (let [cookies (:cookies request)
        json-data (-> request :params :data json/read-str)
        url (-> request :params :url)
        customer_token (-> cookies (get "customer_token") :value)
        customer_id (when (not-empty customer_token) (-> customer_token verify-jwt (get "customer_id")))
        json-data (when (not-empty customer_id) (assoc json-data "customer_id" (Integer/parseInt (str customer_id))))
        ]
    (if (nil? json-data)
      {:status 200 :body "{}"}
      (server-post url [json-data])
      )
    )
  )

(defn get-customer-addresses [request]
  (prn "### get-customer-addresses")
  (let [cookies (:cookies request)
        url (-> request :params :url)
        customer_token (-> cookies (get "customer_token") :value)
        customer_id (when (not-empty customer_token) (-> customer_token verify-jwt (get "customer_id")))
        ]
    (if (nil? customer_id)
      {:status 200 :body "{}"}
      (server-query (str url "?customer_id%3Ain=" customer_id))
      )
    )
  )

(defn add-customerid-to-cart [request]
  (prn "### add-customerid-to-cart")
  (let [cookies (:cookies request)
        url (-> request :params :url)
        customer_token (-> cookies (get "customer_token") :value)
        customer_id (when (not-empty customer_token) (-> customer_token verify-jwt (get "customer_id")))
        ]
    (if (nil? customer_id)
      {:status 200 :body "{}"}
      (server-put url {"customer_id" (Integer/parseInt (str customer_id))})
      )
    )
  )

(defn reset-customer-password [request]
	(prn "### reset-customer-password")
	(let [cookies (:cookies request)
        url (-> request :params :url)
        customer_token (-> cookies (get "customer_token") :value)
        customer_id (when (not-empty customer_token) (-> customer_token verify-jwt (get "customer_id")))
		json-data (json/read-str (-> request :params :data))
        ]
	      (server-put (str url customer_id) json-data)
		)
	)

(defn process-common [request]
  (try+
    (let [params (:params request)
          result (common-post (:url params) (json/read-str (:data params)))
          ]
      (prn "## result=" result)
      (assoc result :cookies (transform-cookies (:cookies result)))
      )
    (catch :status e
      (prn "### e=" e)
      {:status 502 :body (:body e)}
      )
    (catch Exception e
      (prn "### error=" e)
      {:status 501 :body (cjson/generate-string e)}
      )
    )
  )

(defn process-server [request]
  (try+
    (let [url (-> request :params :url)
          data (-> request :params :data)
          result (condp = (-> request :params :method str/upper-case)
                   "GET" (condp re-find url
                           #"\/v2\/orders\?"
                           (get-customer-orders request)
                           #"\/v3\/customers\/addresses"
                           (get-customer-addresses request)
                           (server-query (-> request :params :url))
                           )
                   "DELETE" (server-delete url (json/read-str data))
                   "POST" (condp re-find url
                            #"\/consignments\?include="
                            (cart-to-order url (json/read-str data) request)
                            #"\/v2\/customers\/\d+\/validate"
                            (customer-login url (json/read-str data))
                            #"\/v3\/customers\/addresses"
                            (add-customer-address request)
                            (server-post url (if (string? data) (json/read-str data) data))
                            )
                   "PUT" (condp re-find url
                           #"\/v3\/carts\/"
                           (add-customerid-to-cart request)
                           #"\/v2\/customers\/"
							(reset-customer-password request)
                           (server-put url (json/read-str data))
                           )
                   )
          ]
      (prn "### result" result)
      (assoc result :cookies (transform-cookies (:cookies result)))
      )
    (catch :status e
      (prn "### e=" e)
      {:status 502 :body (:body e)}
      )
    (catch Exception e
      (prn "### error=" e)
      {:status 501 :body (cjson/generate-string e)}
      ))
  )


(defn process-front [request]
  (try+
    (let [cookies (:cookies request)
          token (:value (get cookies "XSRF-TOKEN"))
          session (:value (get cookies "SHOP_SESSION_TOKEN"))
          id (:value (get cookies "fornax_anonymousId"))]
      (if (or (nil? id) (nil? session))
        {:status 200 :body (cjson/generate-string {:error "no cookie"})}
        (let [url (-> request :params :url)
              result (condp = (-> request :params :method str/upper-case)
                       "GET" (front-query url token session id)
                       "DELETE" (front-delete url token session id)
                       "POST" (front-post url token session id (-> request :params :data json/read-str))
                       "PUT" (front-put url token session id (-> request :params :data json/read-str))
                       )]
          (prn "### result" result)
          (assoc result :cookies (transform-cookies (:cookies result)))
          )
        )
      )
    (catch :status e
      (prn "### e=" e)
      {:status 502 :body (:body e)}
      )
    (catch Exception e
      (prn "### error=" e)
      {:status 501 :body (cjson/generate-string e)}
      ))
  )

(defn process-graphql [request]
  (try+
    (let [params (:params request)
          api-token (-> request :cookies (get "api-token") :value)
          api-token (if (and api-token (verify-token api-token)) api-token (get-api-token))
          json-data (json/read-str (:data params))
          result (-> (graphql-query api-token json-data) :body (json/read-str) (get "data"))
          ]
      (prn "## result=" result)
      {:status 200 :body (cjson/generate-string result) :cookies {"api-token" api-token}}
      )
    (catch :status e
      (prn "### e=" e)
      {:status 502 :body (:body e)}
      )
    (catch Exception e
      (prn "### error=" e)
      {:status 501 :body (cjson/generate-string {:error "error"})}
      )
    )
  )

(defn process-card-payment [request]
  (let [order_id (-> request :cookies (get "order_token") :value)
        order_info (:body (server-query (str "/v2/orders/" order_id)))
        order_info (when (not (nil? order_info)) (json/read-str order_info))
        pay_token (-> (server-post "/v3/payments/access_tokens"
                                   {"order"{"id" (Integer/parseInt (str order_id)),
                                            "is_recurring" false}}) :body json/read-str (get "data") (get "id"))
        json-data (-> request :params :data json/read-str)
        json-data (assoc json-data "type" "card")
        pay_currency_code (get order_info "currency_code")
        pay_amount (Float/parseFloat (get order_info "total_inc_tax"))
        pay_amount (if (= pay_currency_code "JPY") (int pay_amount) pay_amount)
        json-data {"payment" {"instrument" json-data
                              "payment_method_id" "stripe.card"
                              "amount" pay_amount
                              "currency_code" pay_currency_code}}
        input {:headers {:x-auth-client (get @store_setting "client_id") :x-auth-token (get @store_setting "access_token") :authorization (str "PAT " pay_token)}
               :content-type "application/json"
               :cookie-policy :standard
               :accept "application/vnd.bc.v1+json"
               :form-params json-data
               }]
    (prn "## input=" input)
    (client/post (str "https://payments.bigcommerce.com/stores/" (get @store_setting "shop_cache") "/payments") input)
    )
  )

(defn process-payment [request]
  (try+
    (let [type (-> request :params :type)]
      (condp = type
        "card"
        (process-card-payment request)
        ""
        )
      )
    (catch :status e
      (prn "### e=" e)
      {:status 502 :body (:body e)}
      )
    (catch Exception e
      (prn "### error=" e)
      {:status 501 :body (cjson/generate-string e)}
      )
    )
  )

(defn get-order-by-id [request]
    (try+
      (let [customer_token (-> request :cookies (get "customer_token") :value)
            customer_id (when (not-empty customer_token) (-> customer_token verify-jwt (get "customer_id")))
            order_id (-> request :params :order_id)
            order_info (-> (server-query (str "/v2/orders/" order_id)) :body json/read-str)
           ]
        (if (= customer_id (get order_info "customer_id"))
          {:status 400 :body "{\"error\" \"There is NOT an order in order list of customer \"}"}
          (let [product_url (-> order_info (get "products") (get "resource"))
                info (-> (server-query (str "/v2" product_url)) :body json/read-str)
                info (map #(assoc % "img" (-> (server-query (str "/v3/catalog/products/" (get %1 "product_id") "/images"))
                                              :body json/read-str (get "data") first (get "url_thumbnail"))) info)
                result (assoc order_info "products" info)
                ]
                (prn "### result" result)
                {:status 200 :body (cjson/generate-string result)}
            )
          )
        )
      (catch :status e
        (prn "### e=" e)
        {:status 502 :body (:body e)}
        )
      (catch Exception e
        (prn "### error=" e)
        {:status 501 :body (cjson/generate-string e)}
        ))
    )
