package example.fontatlas

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** Directory-only client. Never executes or installs remote code. Call on IO dispatcher. */
class FontAtlasCatalog(
    private val endpoint: String = "https://hossean787-blip.github.io/font-atlas-library/api/v1/fonts.json"
) {
    data class Font(val id: String, val name: String, val source: String, val license: String)
    fun fetch(): List<Font> {
        val connection = URL(endpoint).openConnection() as HttpURLConnection
        connection.connectTimeout = 8000
        connection.readTimeout = 8000
        try {
            if (connection.responseCode != 200) error("Catalog HTTP ${connection.responseCode}")
            val payload = connection.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            val root = JSONObject(payload)
            require(root.getString("schemaVersion") == "1.0.0")
            val fonts = root.getJSONArray("fonts")
            return (0 until fonts.length()).map { index ->
                val obj = fonts.getJSONObject(index)
                val id = obj.getString("id")
                require(Regex("[a-z0-9-]+").matches(id))
                Font(id, obj.getString("name"), obj.getString("source"), obj.getString("license"))
            }
        } finally {
            connection.disconnect()
        }
    }
}
// Manifest requires android.permission.INTERNET.
// Usage: withContext(Dispatchers.IO) { FontAtlasCatalog().fetch() }
// This is catalog integration, not a native font file loader.
