<?php


use App\Notifications\ResetPassword;
use App\Utilities\QueryFilters\CommonFilters\Name;
use App\Utilities\QueryFilters\FilterBuilder;
use App\Utilities\QueryFilters\UserFilters\Email;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use jeremykenedy\LaravelRoles\Traits\HasRoleAndPermission;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\PersonalAccessToken;
use Venturecraft\Revisionable\Revision;
use Venturecraft\Revisionable\RevisionableTrait;


$txt = "Hello world!";
$x = 5;
$y = 10.5;

$array = [
    "foo" => "bar",
    "bar" => "foo",
];


$array["foo"] = "test";

$array2 = array(
    "foo" => "bar",
    "bar" => "foo",
);

$today = 'tuesday';

class CSP
{
    public const GRAFANA_CSP_METRIC_BASE = 'products.example.security.csp.';

}

'smtp' => [
    'transport' => 'smtp',
    'host' => env('MAIL_HOST', 'smtp.mailtrap.io'),
    'port' => env('MAIL_PORT', 2525),
    'encryption' => env('MAIL_ENCRYPTION', 'tls'),
    'username' => env('MAIL_USERNAME', 'mailer'),
    'password' => env('MAIL_PASSWORD', 'fjanflkdsanfkjdsanf'),
    'timeout' => null,
]