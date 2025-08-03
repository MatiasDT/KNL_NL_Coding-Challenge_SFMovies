using Moq;

namespace KNL_NL_Coding_Challenge_SFMovies.Server.Tests;

public class FilmLocationsSanFranciscoControllerTests
{
    private readonly Mock<IFilmLocationsSanFranciscoService> _serviceMock;
    private readonly FilmLocationsSanFranciscoController _controller;

    public FilmLocationsSanFranciscoControllerTests()
    {
        _serviceMock = new Mock<IFilmLocationsSanFranciscoService>();
        _controller = new FilmLocationsSanFranciscoController(_serviceMock.Object);
    }

    [Fact]
    public async Task Get_ShouldReturnFilmingLocations_WhenServiceReturnsData()
    {
        // Arrange
        var expectedLocations = new List<FilmingLocation>
        {
            new() { Title = "The Matrix", ReleaseYear = "1999", Locations = "555 Market St", Longitude = -122, Latitude = 37 },
            new() { Title = "Inception", ReleaseYear = "2010", Locations = "Golden Gate Bridge", Longitude = -122, Latitude = 37 }
        };

        _serviceMock.Setup(s => s.GetFilmLocationsAsync())
                   .ReturnsAsync(expectedLocations);

        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result);
        var locations = result.ToList();
        Assert.Equal(2, locations.Count);
        Assert.Equal(expectedLocations.First().Title, locations.First().Title);
        Assert.Equal(expectedLocations.Last().Title, locations.Last().Title);

        _serviceMock.Verify(s => s.GetFilmLocationsAsync(), Times.Once);
    }

    [Fact]
    public async Task Get_ShouldReturnEmptyCollection_WhenServiceReturnsEmpty()
    {
        // Arrange
        _serviceMock.Setup(s => s.GetFilmLocationsAsync())
                   .ReturnsAsync(Enumerable.Empty<FilmingLocation>());

        // Act
        var result = await _controller.Get();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);

        _serviceMock.Verify(s => s.GetFilmLocationsAsync(), Times.Once);
    }
}
