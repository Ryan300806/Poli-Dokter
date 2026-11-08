<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <x-inertia::head />
</head>
<body class="bg-brand-50 text-black antialiased">
    <x-inertia::app />
</body>
</html>