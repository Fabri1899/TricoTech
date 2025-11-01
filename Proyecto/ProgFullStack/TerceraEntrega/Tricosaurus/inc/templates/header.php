<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle : 'Draftosaurus'; ?></title>
    <link rel="icon" type="image/png" href="http://localhost:8012/Tricosaurus/assets/images/logos/logo.png">
    <link rel="stylesheet" href="http://localhost:8012/Tricosaurus/assets/css/styles.css">

    <?php if (isset($customCSS)): ?>
        <?php if (is_array($customCSS)): ?>
            <?php foreach ($customCSS as $css): ?>
                <link rel="stylesheet" href="http://localhost:8012/Tricosaurus/assets/css/<?php echo $css; ?>">
            <?php endforeach; ?>
        <?php else: ?>
            <link rel="stylesheet" href="http://localhost:8012/Tricosaurus/assets/css/<?php echo $customCSS; ?>">
        <?php endif; ?>
    <?php endif; ?>


    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href='https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>

<body>