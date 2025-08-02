using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;

namespace KNL_NL_Coding_Challenge_SFMovies.Server.Tests;

public class FilmLocationsSanFranciscoServiceTests
{
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
    private readonly Mock<ILogger<FilmLocationsSanFranciscoService>> _loggerMock;
    private readonly HttpClient _httpClient;
    private readonly FilmLocationsSanFranciscoService _service;

    public FilmLocationsSanFranciscoServiceTests()
    {
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();
        _loggerMock = new Mock<ILogger<FilmLocationsSanFranciscoService>>();
        _httpClient = new HttpClient(_httpMessageHandlerMock.Object);
        _service = new FilmLocationsSanFranciscoService(_httpClient, _loggerMock.Object);
    }

    [Fact]
    public async Task GetFilmLocationsAsync_WhenApiReturnsSuccess_ShouldReturnMappedFilmingLocations()
    {
        // Arrange
        var apiResponse = new[]
        {
            new SfMovieApiResponse
            {
                Title = "The Matrix",
                Release_Year = 1999,
                Locations = "555 Market St",
                Longitude = -122,
                Latitude = 37
            }
        };

        var jsonResponse = JsonSerializer.Serialize(apiResponse);
        var httpResponse = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(jsonResponse, Encoding.UTF8, "application/json")
        };

        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(httpResponse);

        // Act
        var result = await _service.GetFilmLocationsAsync();

        // Assert
        Assert.NotNull(result);
        var filmingLocations = result.ToList();
        Assert.Single(filmingLocations);

        var location = filmingLocations.First();
        Assert.Equal("The Matrix", location.Title);
        Assert.Equal(1999, location.ReleaseYear);
        Assert.Equal("555 Market St", location.Locations);
        Assert.Equal(-122, location.Longitude);
        Assert.Equal(37, location.Latitude);
    }

    [Fact]
    public async Task GetFilmLocationsAsync_WhenApiReturnsError_ShouldReturnEmptyAndLogWarning()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError);

        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(httpResponse);

        // Act
        var result = await _service.GetFilmLocationsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("API call failed with status code")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetFilmLocationsAsync_WhenHttpRequestExceptionThrown_ShouldReturnEmptyAndLogError()
    {
        // Arrange
        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("Network error"));

        // Act
        var result = await _service.GetFilmLocationsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error calling external API")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetFilmLocationsAsync_WhenInvalidJson_ShouldReturnEmptyAndLogError()
    {
        // Arrange
        var httpResponse = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("invalid json", Encoding.UTF8, "application/json")
        };

        _httpMessageHandlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(httpResponse);

        // Act
        var result = await _service.GetFilmLocationsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error deserializing API response")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
