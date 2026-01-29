<?php
/**
 * Admin Login Page
 */

require_once __DIR__ . '/../includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'Bitte geben Sie Benutzername und Passwort ein.';
    } elseif (authenticateAdmin($username, $password)) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Ungültige Anmeldedaten.';
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Alte Post</title>
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <h1>Alte Post</h1>
                <p>Admin-Bereich</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error">
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="login.php" class="login-form">
                <div class="form-group">
                    <label for="username">Benutzername</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        autofocus
                        autocomplete="username"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Passwort</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        autocomplete="current-password"
                    >
                </div>

                <button type="submit" class="btn btn-primary btn-block">
                    Anmelden
                </button>
            </form>
        </div>

        <p class="login-footer">
            <a href="/">&larr; Zurück zur Website</a>
        </p>
    </div>
</body>
</html>
