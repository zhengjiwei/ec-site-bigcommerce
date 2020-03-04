(ns ecsite.common.other
  (:gen-class)
  (:require
    [clj-time.core :as time-core]
    [clj-time.coerce :as time-coerce]
    [clojure.string :as str]
    )
  (:import
    (java.util Date TimeZone Locale Calendar)
    (java.sql Timestamp)
    java.text.SimpleDateFormat
    (java.net URI URLEncoder)
    (org.joda.time DateTimeZone DateTime)
	)
  )

(defn get-gmt-string
  "Sun, 06 Nov 1994 08:49:37 GMT  ; RFC 822, updated by RFC 1123"
  ([^Date date ^String fmt]
    (if date
      (let [df (SimpleDateFormat. fmt Locale/US)
            tz (TimeZone/getTimeZone "GMT")]
        (.setTimeZone df tz)
        (.format df date)
        )
      )
    )
  )
