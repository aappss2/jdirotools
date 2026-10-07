<?php
header("Content-Type: application/json");

// Input
$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url) {
    echo json_encode(["success"=>false,"error"=>"No URL"]);
    exit;
}

// Fetch Flipkart page
$html = file_get_contents($url);
if (!$html) {
    echo json_encode(["success"=>false,"error"=>"Unable to fetch"]);
    exit;
}

// Extract title, price, image (basic regex scraping)
preg_match('/<span class="B_NuCI">(.*?)<\/span>/', $html, $titleMatch);
preg_match('/<div class="_30jeq3 _16Jk6d">₹([\d,]+)/', $html, $priceMatch);
preg_match('/<img class="_396cs4" alt=".*?" src="(.*?)"/', $html, $imgMatch);

$title = $titleMatch[1] ?? "Unknown Product";
$price = str_replace(",", "", $priceMatch[1] ?? "0");
$image = $imgMatch[1] ?? "";

// Save price history
$hash = md5($url);
$file = "history_$hash.json";
$history = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

$today = date("Y-m-d");
$history[] = ["date"=>$today, "price"=>$price];
file_put_contents($file, json_encode($history));

// Response
echo json_encode([
    "success" => true,
    "title" => $title,
    "price" => $price,
    "image" => $image,
    "history" => $history
]);
?>
