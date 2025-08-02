using KNL_NL_Coding_Challenge_SFMovies.Server;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure HttpClient for service
builder.Services.AddHttpClient<FilmLocationsSanFranciscoService>(client =>
{
    client.BaseAddress = new Uri("https://data.sfgov.org/");
    client.DefaultRequestHeaders.Add("User-Agent", "SFMoviesApp/1.0");
    
    var appToken = builder.Configuration["SfMoviesApp:AppToken"];
    if (!string.IsNullOrEmpty(appToken))
    {
        client.DefaultRequestHeaders.Add("X-App-Token", appToken);
    }

    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddScoped<IFilmLocationsSanFranciscoService, FilmLocationsSanFranciscoService>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
