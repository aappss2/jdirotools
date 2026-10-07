<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class DomainChecker {
    private $popularTLDs = [
        'com', 'net', 'org', 'io', 'co', 'info', 'biz', 'me', 'us', 'ca',
        'uk', 'de', 'fr', 'it', 'es', 'nl', 'au', 'in', 'jp', 'cn'
    ];

    public function checkDomain($domain, $tlds) {
        $results = [];
        
        foreach ($tlds as $tld) {
            $fullDomain = $domain . '.' . $tld;
            $isAvailable = $this->isDomainAvailable($fullDomain);
            
            $results[] = [
                'domain' => $fullDomain,
                'tld' => $tld,
                'available' => $isAvailable,
                'whois' => $isAvailable ? null : $this->getWhoisInfo($fullDomain)
            ];
        }
        
        return $results;
    }

    private function isDomainAvailable($domain) {
        // Using fsockopen to check domain availability
        $timeout = 10;
        $available = false;
        
        if ($socket = @fsockopen('whois.verisign-grs.com', 43, $errno, $errstr, $timeout)) {
            fwrite($socket, $domain . "\r\n");
            $response = '';
            
            while (!feof($socket)) {
                $response .= fgets($socket, 128);
            }
            fclose($socket);
            
            // Check for patterns that indicate the domain is available
            $available = (strpos($response, 'No match for') !== false) ||
                        (strpos($response, 'NOT FOUND') !== false) ||
                        (strpos($response, 'Available') !== false);
        }
        
        return $available;
    }

    private function getWhoisInfo($domain) {
        // Simplified WHOIS information
        // In a real application, you'd parse the actual WHOIS response
        return [
            'registrar' => 'Unknown Registrar',
            'created_date' => date('Y-m-d', strtotime('-1 year')),
            'expiry_date' => date('Y-m-d', strtotime('+1 year')),
            'name_servers' => ['ns1.example.com', 'ns2.example.com']
        ];
    }

    public function generateSuggestions($keyword) {
        $suggestions = [];
        $variations = [
            $keyword . 'app',
            $keyword . 'online',
            $keyword . 'site',
            $keyword . 'web',
            'get' . $keyword,
            'the' . $keyword,
            'my' . $keyword,
            $keyword . 'hq',
            $keyword . 'io',
            $keyword . 'co'
        ];
        
        foreach ($variations as $suggestion) {
            $suggestions[] = [
                'domain' => $suggestion,
                'premium' => rand(0, 100) > 80 // 20% chance of being premium
            ];
        }
        
        return $suggestions;
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $checker = new DomainChecker();
    
    if (isset($input['action'])) {
        switch ($input['action']) {
            case 'check_domains':
                if (isset($input['domain']) && isset($input['tlds'])) {
                    $results = $checker->checkDomain($input['domain'], $input['tlds']);
                    echo json_encode(['success' => true, 'results' => $results]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Missing domain or TLDs']);
                }
                break;
                
            case 'get_suggestions':
                if (isset($input['keyword'])) {
                    $suggestions = $checker->generateSuggestions($input['keyword']);
                    echo json_encode(['success' => true, 'suggestions' => $suggestions]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Missing keyword']);
                }
                break;
                
            default:
                echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'No action specified']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>