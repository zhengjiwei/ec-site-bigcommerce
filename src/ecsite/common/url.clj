(ns ecsite.common.url
  (:gen-class)
  (:require
    [clojure.string :as str]
    [ring.util.codec :as codec]
    )
  (:import
    (java.net URI URLEncoder)
    )
  )

(defn- encode3986
  "RFC 3986 に準拠 :query-stringのkey,value,やpath の partsなどを対象とする"
  [^String s]
  (when s
    (-> (URLEncoder/encode
          (codec/url-decode s "UTF-8");%decodeする
          "UTF-8")
      (.replace "+" "%20") ;URI/getQuery で + は +のままなので2度uri-encodeされると１度目 で " " -> "+" ２度目で "+" -> "%2B" となるのを防ぐため"+"は"%20"に置換しておく
      (.replace "*" "%2A")
      (.replace "%7E" "~") ;変換不要な~を元に戻す
      )))

(defn- query-encode [queryStr]
  (when-not (str/blank? queryStr)
    (let [m (reduce
              (fn [m param]
                (if-let [[k v] (str/split param #"=" 2)]
                  (codec/assoc-conj m k v) m))
              {} (str/split queryStr #"&"))
          encode-param-fn (fn [[k v]]
                      (str (encode3986 (name k))
                        (when v (str "=" (encode3986 v)))))]
      (->> m
        (mapcat
          (fn [[k v]]
            (if (or (seq? v) (sequential? v))
              (map #(encode-param-fn [k %]) v)
              [(encode-param-fn [k v])])))
        (str/join "&")))))

(defn- path-encode [^String path]
  (when path
    (str
      (str/join "/" (map #(encode3986 %) (str/split path #"/")))
      (if (.endsWith path "/") "/" ""))))

(defn- encode-SpecificPart [^String s]
  (let [[sp query] (when s (str/split s #"\?" 2))]
    (str (query-encode sp) (if query (str "?" (query-encode query))))))

(defn uri-encode [uri]
  (try
    (let [uriStr (-> uri str str/trim
                   (.replaceAll " " "%20")
                   (.replaceAll "\u00a0" "%20")
                   (.replaceAll "&nbsp;" "%20")
                   (.replaceAll "<" "%3c")
                   (.replaceAll ">" "%3e")
                   (.replaceAll "\"" "%22")
                   (.replaceAll "`" "%60")
                   (.replaceAll "\\]" "%5d")
                   (.replaceAll "\\[" "%5b")
                   (.replaceAll "\\{" "%7b")
                   (.replaceAll "\\}" "%7D")
                   (.replaceAll "\\|" "%7C")
                   (.replaceAll "\\^" "%5E")
                   (.replaceAll "\\\\" "%5C")
                   (.replaceAll "　" "%E3%80%80")
                   (.replaceAll "\t" "%09")
                   (.replaceAll "\r" "%0D")
                   (.replaceAll "\n" "%0A")
                   (.replaceAll "\b" "%08"))
          tUri (URI. uriStr)
          scheme (. tUri getScheme)]
      (if-not (or (nil? scheme) (= "http" scheme) (= "https" scheme) (= "ftp" scheme) (= "file" scheme))
        (str scheme ":" (encode-SpecificPart (. tUri getRawSchemeSpecificPart)))
        (let [ path (path-encode (. tUri getRawPath))
               query (query-encode (. tUri getRawQuery))
               query (if (str/blank? query) "" (str "?" query))
               flagment (. tUri getRawFragment)
               flagment (if (str/blank? flagment) "" (str "#" (query-encode flagment)))]
          (str (.toASCIIString (URI.
                                 (. tUri getScheme)
                                 (. tUri getUserInfo)
                                 (. tUri getHost)
                                 (. tUri getPort)
                                 nil nil nil)) path query flagment)
          )
        )
      )
    (catch Exception e
      uri
      )
    )
  )

(defn molding-url
  ([spec]
    (try
      (let [uri (URI. (uri-encode spec))
            scheme (. uri getScheme)
            hostname (. uri getHost)
            userinfo (. uri getUserInfo)
            port (. uri getPort)
            path (.replaceAll (str (. uri getPath)) "//" "/")
            query (. uri getQuery)
            fragment (. uri getFragment)
        ]
        (.toASCIIString (URI. scheme userinfo hostname port path query fragment))
        )
      (catch Exception e
        )
      )
    )
  ([spec params-map]
    (if (empty? params-map)
      (molding-url spec)
      (try
        (let [uri (URI. (uri-encode spec))
              scheme (. uri getScheme)
              userinfo (. uri getUserInfo)
              hostname (. uri getHost)
              port (. uri getPort)
              path (. uri getPath)
              path (.replaceAll path "//" "/")
              query (. uri getQuery)
              query
              (str (if (str/blank? query) query (str query "&"))
                   (str/join "&"
                             (reduce
                               (fn [c [k v]]
                                 (cond
                                   (coll? v) (concat c (map #(str k "=" %) v))
                                   :else
                                   (conj c (str k "=" v))
                                   )) [] params-map)
                             ))
              fragment (. uri getFragment)
              ]
          (.toASCIIString (URI. scheme userinfo hostname port path query fragment))
          )
        (catch Exception e
          )
        )
      )
    )
  )

(defn is-printable-chars?
  ;"以下の文字が含まれていない場合、trueを返す ISO 制御文字  Java 識別子または Unicode 識別子内で無視可能な文字"
  [^String s]
  (and (string? s)
       (not-any?
        (fn [^Character c]
          (or
            (Character/isIdentifierIgnorable c)
            (Character/isISOControl c)))
        (seq s))))

(defn bad-filename-pattern []
    #"(^__MACOSX$)|(.*[\.~]$)|(^\..*)|(.*[\\\/:\*\?\"<>\|#%].*)|(?i:^(CON|PRN|AUX|CLOCK\$|NUL|COM[1-9]|LPT[1-9])(\..*)?$)|(?i:^.*\.(o|lo|la|rej|swp|swo|swn)?$)"
  )
(defn has-bad-file-name-pattern? [^String name]
  (try
    (or
      (not (nil? (re-seq (bad-filename-pattern) name)))
      (false? (is-printable-chars? name))
      )
    (catch Exception _ true)
    )
  )
(defn some-bad-file-name-pattern? [col]
  (some #(has-bad-file-name-pattern? (str %)) col)
  )
(defn trim-filename [s]
  (try
    ((comp str/triml str/trimr) s)
    (catch Exception e s)
    )
  )

(defn ^String trim-name-for-path [^String filename]
  (str/join "/" (map trim-filename (str/split filename (re-pattern "/"))))
  )

(defn create-url-by-hostinf-and-path [host-info path]
  (let [{:keys [scheme hostname http-port ssl-port rproxy]} host-info]
    (molding-url
      (str
        (name scheme) "://"
        (cond
          (and (= :http scheme) (not= http-port 80) (not rproxy))
          (str hostname ":" http-port)
          (and (= :https scheme) (not= ssl-port 443) (not rproxy))
          (str hostname ":" ssl-port)
          :else
          hostname
          )
        "/" path)
      )
    )
  )

(defn url-encode [^String v]
  (when v (URLEncoder/encode v "UTF-8"))
  )
