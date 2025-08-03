using System.Globalization;
using System.Text.Json;

namespace KNL_NL_Coding_Challenge_SFMovies.Server;

public class FilmLocationsSanFranciscoService : IFilmLocationsSanFranciscoService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FilmLocationsSanFranciscoService> _logger;

    public FilmLocationsSanFranciscoService(HttpClient httpClient, ILogger<FilmLocationsSanFranciscoService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IEnumerable<FilmingLocation>> GetFilmLocationsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("https://data.sfgov.org/resource/yitu-d5am.json?$limit=3000");

            if (response.IsSuccessStatusCode)
            {
                var jsonContent = await response.Content.ReadAsStringAsync();
                var apiData = JsonSerializer.Deserialize<SfMovieApiResponse[]>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return apiData?
                    .Where(x => !string.IsNullOrEmpty(x.Title) && !string.IsNullOrEmpty(x.Latitude) && !string.IsNullOrEmpty(x.Longitude))
                    .Select(MapToFilmingLocation) ?? [];
            }

            _logger.LogWarning("API call failed with status code: {StatusCode}", response.StatusCode);
            return Enumerable.Empty<FilmingLocation>();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error calling external API");
            return Enumerable.Empty<FilmingLocation>();
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error deserializing API response");
            return Enumerable.Empty<FilmingLocation>();
        }
    }

    private static FilmingLocation MapToFilmingLocation(SfMovieApiResponse apiResponse)
    {
        return new FilmingLocation
        {
            Title = apiResponse.Title,
            ReleaseYear = apiResponse.Release_Year,
            Locations = apiResponse.Locations,
            Longitude = ParseDouble(apiResponse.Longitude),
            Latitude = ParseDouble(apiResponse.Latitude),
        };
    }

    private static double ParseDouble(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return 0.0;

        return double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var result)
            ? result
            : 0.0;
    }
}
