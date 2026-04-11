FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore
COPY AIQuizApp.csproj ./
RUN dotnet restore "AIQuizApp.csproj"

# copy everything else
COPY . ./
RUN dotnet publish "AIQuizApp.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "AIQuizApp.dll"]