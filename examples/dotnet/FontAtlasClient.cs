using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FontAtlasIntegration {
 public sealed class FontAtlasClient {
  private readonly HttpClient http;
  public FontAtlasClient(HttpClient client) { http = client; }
  public async Task<IReadOnlyList<FontRecord>> FetchAsync() {
   const string url = "https://hossean787-blip.github.io/font-atlas-library/api/v1/fonts.json";
   using var response = await http.GetAsync(url);
   response.EnsureSuccessStatusCode();
   using var data = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
   var root = data.RootElement;
   if(root.GetProperty("schemaVersion").GetString() != "1.0.0") throw new InvalidOperationException("Catalog schema");
   var result = new List<FontRecord>();
   foreach(var item in root.GetProperty("fonts").EnumerateArray()) {
    var id = item.GetProperty("id").GetString() ?? "";
    if(!Regex.IsMatch(id, "^[a-z0-9-]+$")) throw new FormatException("Invalid font id");
    result.Add(new FontRecord(id,item.GetProperty("name").GetString() ?? "",item.GetProperty("source").GetString() ?? "",item.GetProperty("license").GetString() ?? ""));
   }
   return result;
  }
 }
 public sealed record FontRecord(string Id,string Name,string Source,string License);
}
// Requires .NET 6+. This reads the catalog, not physical font binaries.
