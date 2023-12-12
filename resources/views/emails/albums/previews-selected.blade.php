<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
</head>
<body>
<h2>Album: {{ $album->name}}</h2>
<p>The previews have been selected and are ready for editing.</p>
</body>
</html>