-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Хост: 127.0.0.1
-- Время создания: Июл 23 2017 г., 23:14
-- Версия сервера: 5.5.25
-- Версия PHP: 5.3.13

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `journal`
--

-- --------------------------------------------------------

--
-- Структура таблицы `attachment`
--

CREATE TABLE IF NOT EXISTS `attachment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET cp1251 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `group`
--

CREATE TABLE IF NOT EXISTS `group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(22) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `list`
--

CREATE TABLE IF NOT EXISTS `list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `series` varchar(48) NOT NULL COMMENT 'Индификатор',
  `attachment_id` int(11) NOT NULL COMMENT 'Принадлежность',
  `address` varchar(64) NOT NULL COMMENT 'Номер Абонентской Линии',
  `equipment` varchar(32) NOT NULL COMMENT 'Оборудование',
  `type_equipment` varchar(32) NOT NULL COMMENT 'Тип оборудования',
  `seal` tinyint(1) NOT NULL COMMENT 'Гарантия',
  `cause` text NOT NULL,
  `status` int(1) NOT NULL DEFAULT '1' COMMENT 'Статус заявки',
  `receipt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата получения',
  `start_repair` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Дата ремонта',
  `end_repair` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Дата выдачи',
  `issued` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `got` varchar(32) NOT NULL COMMENT 'Кто получил',
  `group_id` int(11) NOT NULL COMMENT 'Id Отдела',
  `note` text NOT NULL COMMENT 'Примечание',
  `contact` text NOT NULL COMMENT 'Контактное лицо',
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(22) NOT NULL,
  `password` varchar(64) NOT NULL,
  `group_id` int(32) NOT NULL,
  `role` int(4) NOT NULL DEFAULT '1',
  `access_group` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=20 ;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `group_id`, `role`, `access_group`) VALUES
(1, 'admin', '39ec37cd2ef52f5cf5e9449345f10dc737d5773c', 1, 4, '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
